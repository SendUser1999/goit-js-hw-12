import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const icon = 'path/to/icon.png';
const formSearch = document.querySelector('.form');
const imageList = document.querySelector('.gallery');
const loader = document.querySelector('.loader');

const gallery = new SimpleLightbox('.gallery a', {
    captionData: 'alt',
    captionDelay: 250,
});

formSearch.addEventListener('submit', handleSearch);

async function handleSearch(event) {
    event.preventDefault();
    const searchQuery = event.currentTarget.elements.input.value;

    imageList.innerHTML = '';
    loader.classList.remove('is-hidden');

    if (!searchQuery.trim()) {
        showNotification({
            title: '❕',
            theme: 'light',
            message: 'Please, fill in the search field',
            messageSize: '20px',
            messageColor: '#808080',
            backgroundColor: '#e7fc44',
            position: 'topLeft',
            timeout: 3000,
        });
    return;
    }

    try {
        const data = await fetchImages(searchQuery);

        if (data.hits.length === 0) {
            showNotification({
                iconUrl: icon,
                theme: 'dark',
                message: 'Sorry, there are no images matching your search query. Please try again!',
                messageSize: '16px',
                messageColor: 'white',
                backgroundColor: '#EF4040',
                position: 'topRight',
                timeout: 5000,
            });
        }
        
        imageList.innerHTML = createMarkup(data.hits);
        gallery.refresh();
    } catch (error) {
        handleError(error);
    } finally {
        loader.classList.add('is-hidden');
    }
    event.currentTarget.reset();
}
async function fetchImages(value) {
    const BASE_URL = 'https://pixabay.com/api/';

    const searchParams = {
        key: '42027170-68cc294651d415255967a4fd3',
        q: value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
    };

    try {
        const response = await axios.get(BASE_URL, { params: searchParams });

        if (response.status !== 200) {
            throw new Error(response.status);
        }

        return response.data;
    } catch (error) {
        throw new Error(error.message || 'Error fetching images');
    }
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

function showNotification(options) {
  iziToast.show(options);
}

function handleError(err) {
  console.error(err);
  imageList.innerHTML = '';
  showNotification({
    iconUrl: icon,
    theme: 'dark',
    message: 'Sorry, there is a problem with connection with the server.',
    messageSize: '16px',
    messageColor: 'white',
    backgroundColor: '#EF4040',
    position: 'center',
    timeout: 5000,
  });
}

