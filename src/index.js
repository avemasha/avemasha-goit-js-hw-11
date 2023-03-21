import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '34463648-52ae7b431b36c8e3f85583ecc';
const BASIC_URL = `https://pixabay.com/api/?key=${API_KEY}&q=`;
const searchFields = '&image_type=photo&orientation=horizontal&safesearch=true';

const cardBox = document.querySelector('.main-gallery');
const refs = {
  form: document.querySelector('#search-form'),
  loadMoreBtn: document.querySelector('.load-more'),
  submitBtn: document.querySelector('#submit'),
  input: document.querySelector('input'),
};
refs.form.addEventListener('submit', formSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);


refs.loadMoreBtn.disabled = true;
let isShown = 0;

class GetImages {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.newQuery = '';
    this.PER_PAGE = 40;
  }
  async getImages() {
   
    const axiosOptions = {
      method: 'get',
      url: 'https://pixabay.com/api/',
      params: {
        key: '34463648-52ae7b431b36c8e3f85583ecc',
        q: `${this.searchQuery}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: `${this.page}`,
        per_page: `${this.PER_PAGE}`,
      },
    };
    try {
      const response = await axios(axiosOptions);

      const data = response.data;

    
     


      return data;
     
      
    } catch (error) {
      console.error(error);
    }

    
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
  incrementPage() {
    this.page += 1;
  }
}
const newImgService = new GetImages();




async function formSubmit(evt) {
  refs.loadMoreBtn.disabled = true;
  evt.preventDefault();
  const { searchQuery } = evt.currentTarget;
  newImgService.query = searchQuery.value.trim();
  newImgService.resetPage();
  if (newImgService.query === '') {
    Notify.warning('Please, type something :(');
    return;
  }

   
  isShown = 0;
  getImages()
  
}



async function getImages() {
  
  try { 
  const data = await newImgService.getImages();
  const allHits = data.hits.length;
  const maxHits = data.totalHits;
  const { hits, total } = data;
  isShown += hits.length;

  if (hits.length === 0) {
    Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    refs.loadMoreBtn.disabled = true;
    return;
  }

  renderImgCards(hits);
  isShown += hits.length;

  if ( newImgService.page < 2 ) {
    Notify.success(`Hooray! We found ${maxHits} images !!!`);
    refs.loadMoreBtn.disabled = false;
  }

 

  if (  hits.length < 40) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMoreBtn.disabled = true;
    return;
  }

  refs.loadMoreBtn.disabled = false;
} catch {
  (error) 
    console.error(error);
}
}



async function onLoadMore() {
  newImgService.incrementPage();
  getImages()

}


async function renderImgCards(images) {
  
  const markup = images
    .map(img => {
    

      return ` 
      
      <div class="photo-card">
   <a href="${img.largeImageURL}">
    <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy"  class="gallery__image" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes </b><span>${img.likes}</span>
      </p>
      <p class="info-item">
        <b>Views </b><span>${img.views}</span>
      </p>
      <p class="info-item">
        <b>Comments </b><span>${img.comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads </b><span>${img.downloads}</span>
      </p>
    </div>
  </div>`;
    })
    .join('');
  
  if (newImgService.page === 1) {
    cardBox.innerHTML = markup;
  }
  if (newImgService.page !== 1) {
    cardBox.insertAdjacentHTML('beforeend', markup);
  }
  modalListener();
}
function modalListener() {
  let galleryLarge = new SimpleLightbox('.photo-card a');
  cardBox.addEventListener('click', evt => {
    evt.preventDefault();
    galleryLarge.on('show.simplelightbox', () => {
      galleryLarge.defaultOptions.captionDelay = 250;
    });
  });
  galleryLarge.refresh();
}

