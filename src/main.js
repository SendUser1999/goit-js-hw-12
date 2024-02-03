import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formSearch = document.querySelector('.form');
const imageList = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more-btn');

const gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let page = 1;
let currentSearchQuery = ''; // Додайте глобальну змінну для зберігання поточного тегу

formSearch.addEventListener('submit', handleSearch);
loadMoreBtn.addEventListener('click', loadMoreImages);

function handleSearch(event) {
    event.preventDefault();
    const searchQuery = event.currentTarget.elements.input.value;

    imageList.innerHTML = '';
    loader.classList.remove('is-hidden');
    page = 1;
    currentSearchQuery = searchQuery;

    if (!searchQuery.trim()) {
        iziToast.warning({
            message: 'Please, fill in the search field',
            position: 'topLeft',
            timeout: 3000,
        });
        loader.classList.add('is-hidden');
        return;
    }

    fetchImages(searchQuery)
        .then(data => {
            if (data.hits.length === 0) {
                iziToast.error({
                    message: 'Sorry, there are no images matching your search query. Please try again!',
                    position: 'topRight',
                    timeout: 5000,
                });
            }
            imageList.innerHTML = createMarkup(data.hits);
            gallery.refresh();
            showLoadMoreButton(data.hits.length, data.totalHits);
        })
        .catch(handleError)
        .finally(() => {
            loader.classList.add('is-hidden');
            showLoadMoreButton(15, data.totalHits);
        });
  event.currentTarget.reset();
}

function fetchImages(value) {
  const BASE_URL = 'https://pixabay.com/api/';
  const perPage = 15;

  const searchParams = new URLSearchParams({
    key: '42027170-68cc294651d415255967a4fd3',
    q: value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
  });

  return fetch(`${BASE_URL}/?${searchParams}`).then(res => {
    if (!res.ok) {
      throw new Error(res.status);
    }
    return res.json();
  });
}

function createMarkup(arr) {
  return arr
    .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
      `<li class="gallery-item">
        <a class="gallery-link" href="${largeImageURL}">
           <img class="gallery-image" src="${webformatURL}" alt="${tags}" />
        </a>
        <div class="container-additional-info">
          <div class="container-descr-inner"><p class="description">Likes</p><span class="description-value">${likes}</span></div>
          <div class="container-descr-inner"><p class="description">Views</p><span class="description-value">${views}</span></div>
          <div class="container-descr-inner"><p class="description">Comments</p><span class="description-value">${comments}</span></div>
          <div class="container-descr-inner"><p class="description">Downloads</p><span class="description-value">${downloads}</span></div>
        </div>
      </li>`
    )
    .join('');
}

function handleError(err) {
  console.error(err);
  imageList.innerHTML = '';
  iziToast.error({
    message: 'Sorry, there is a problem with the connection with the server.',
    position: 'center',
    timeout: 5000,
  });
}

function loadMoreImages() {
    page++;
    loader.classList.remove('is-hidden'); 
  const galleryItemHeight = document.querySelector('.gallery-item').getBoundingClientRect().height;
  fetchImages(currentSearchQuery) 
    .then(data => {
      if (data.hits.length > 0) {
        const newImagesMarkup = createMarkup(data.hits);
        imageList.insertAdjacentHTML('beforeend', newImagesMarkup);
        gallery.refresh();
        const scrollDistance = galleryItemHeight * 2;
        window.scrollBy({
          top: scrollDistance,
          behavior: 'smooth',
        });
      }
      showLoadMoreButton(data.hits.length, data.totalHits);
    })
      .catch(handleError)
    .finally(() => {
      loader.classList.add('is-hidden'); 
    });
}

function showLoadMoreButton(imagesCount, totalHits) {
  if (imagesCount >= 15 && totalHits && page * 15 < totalHits) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
    if (totalHits && page * 15 >= totalHits) {
      showEndOfResultsMessage();
    }
  }
}

function showEndOfResultsMessage() {
  iziToast.info({
    message: "We're sorry, but you've reached the end of search results.",
    position: 'bottomCenter',
    timeout: 5000,
  });
}

