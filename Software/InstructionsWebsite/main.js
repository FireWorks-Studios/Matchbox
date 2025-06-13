const slides = [];

for (let i = 1; i <= 47; i++) {
  slides.push(`assets/${i}.jpeg`);
}

let current = 0;
const slideArea = document.getElementById('slideArea');

// Helper to render the current slide as an image
function renderSlide(index) {
  slideArea.innerHTML = `<img src="${slides[index]}" alt="Slide ${index + 1}" style="max-width:100%; max-height:100%;">`;
}

// Initial render
renderSlide(current);

document.getElementById('leftBtn').onclick = () => {
  current = (current - 1 + slides.length) % slides.length;
  renderSlide(current);
};
document.getElementById('rightBtn').onclick = () => {
  current = (current + 1) % slides.length;
  renderSlide(current);
};