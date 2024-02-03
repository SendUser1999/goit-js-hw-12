import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';


const formSearch = document.querySelector('.form');
const imageList = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more-btn');

const gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let currentPage = 1;

formSearch.addEventListener('submit', handleSearch);
loadMoreBtn.addEventListener('click', handleLoadMore);

let endMessageExists = false;

function handleSearch(event) {
  event.preventDefault();
  const searchQuery = event.currentTarget.elements.input.value;

  imageList.innerHTML = '';
    currentPage = 1;
    hideEndMessage();

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

  fetchAndRenderImages(searchQuery);
}

async function fetchAndRenderImages(value) {
    try {
        const data = await fetchImages(value, currentPage);
        
        if (data.hits.length === 0) {
            showNotification({
                title: '❕',
                theme: 'dark',
                message: 'Sorry, there are no images matching your search query. Please try again!',
                messageSize: '16px',
                messageColor: 'white',
                backgroundColor: '#EF4040',
                position: 'topRight',
                timeout: 5000,
            });
        } else {
            imageList.innerHTML += createMarkup(data.hits);
            gallery.refresh();
            showLoadMoreBtn();
            hideEndMessage();
            smoothScrollToNextGroup();
      
      if (data.hits.length < data.totalHits) {
        updateLoadMoreButtonState(data.totalHits, data.hits);
      } else {
        hideLoadMoreBtn();
        showEndMessage();
        endMessageExists = true;
      }
    }

  } catch (error) {
    handleError(error);
  } finally {
    loader.classList.add('is-hidden');
  }
}

function updateLoadMoreButtonState(totalHits) {
  const remainingHits = totalHits - currentPage * 15;

  if (remainingHits <= 0) {
      hideLoadMoreBtn();
      if (!endMessageExists) {
          showEndMessage(); 
          endMessageExists = true;
      }
  }
}

async function fetchImages(value, page = 1, perPage = 15) {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '42027170-68cc294651d415255967a4fd3';

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    });

    if (response.status !== 200) {
      throw new Error(response.status);
    }

    return response.data;
  } catch (error) {
    throw new Error(error);
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
        title: '❕',
        theme: 'dark',
        message: 'Sorry, there is a problem with the connection to the server.',
        messageSize: '16px',
        messageColor: 'white',
        backgroundColor: '#EF4040',
        position: 'center',
        timeout: 5000,
    });
}

function handleLoadMore() {
  currentPage += 1;
  const searchQuery = formSearch.elements.input.value;
  loader.classList.remove('is-hidden');
    hideLoadMoreBtn();
    hideEndMessage();
    fetchAndRenderImages(searchQuery);
}

function showLoadMoreBtn() {
    loadMoreBtn.classList.remove('is-hidden');
}

function hideLoadMoreBtn() {
  loadMoreBtn.classList.add('is-hidden');
}

function showEndMessage() {
  const endMessage = document.createElement('div');
  endMessage.classList.add('end-message');
    endMessage.textContent = "We're sorry, but you've reached the end of search results.";
    document.body.appendChild(endMessage);
}

function hideEndMessage() {
  const endMessage = document.querySelector('.end-message');
  
  if (endMessage) {
      endMessage.remove();
  }
}

function smoothScrollToNextGroup() {
  const cardHeight = document.querySelector('.gallery-item').getBoundingClientRect().height;
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}




