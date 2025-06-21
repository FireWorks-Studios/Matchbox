const slides = [];
for (let i = 1; i <= 47; i++) {
  slides.push(`assets/${i}.jpeg`);
}

// Elements
const slideArea = document.getElementById('slideArea');
const slideNumberInput = document.getElementById('slideNumber');
const tooltip = document.getElementById('tooltip');
const stepTitle = document.getElementById('stepTitle');
const stepInstructions = document.getElementById('stepInstructions');

// State
let instructionsData = [];
let current = parseInt(localStorage.getItem('step'), 10);
if (isNaN(current) || current < 1 || current > slides.length) {
  current = 1;
  localStorage.setItem('step', current);
}
let usingSlideNumInput = false;

function showTooltip(message) {
  tooltip.textContent = message;
  tooltip.style.display = 'block';
  setTimeout(() => {
    tooltip.style.display = 'none';
  }, 2000);
}

// Preload a specific image by index (1-based)
function preloadImage(index) {
  if (index < 1 || index > slides.length) return;
  const img = new Image();
  img.src = slides[index - 1];
}

function renderSlide(index) {
  // Calculate indices for prev, current, next (1-based)
  const prevIdx = (index - 2 + slides.length) % slides.length + 1;
  const nextIdx = (index % slides.length) + 1;

  slideArea.innerHTML = `
    <div style="position:relative; width:100%; min-height:200px;">
      <img id="prevImg" src="${slides[prevIdx - 1]}" alt="Previous Slide"
        style="max-width:100%; max-height:80vh; display:none; position:absolute; left:0; right:0; top:0; bottom:0; margin:auto; z-index:1; transition:opacity 0.5s;">
      <img id="currentImg" src="${slides[index - 1]}" alt="Current Slide"
        style="max-width:100%; max-height:80vh; display:block; position:absolute; margin:0 auto; left:0; right:0; top:0; bottom:0; z-index:2; opacity:1; transition:opacity 0.5s;">
      <img id="nextImg" src="${slides[nextIdx - 1]}" alt="Next Slide"
        style="max-width:100%; max-height:80vh; display:none; position:absolute; left:0; right:0; top:0; bottom:0; margin:auto; z-index:1; transition:opacity 0.5s;">
      <img src="assets/placeholder.png" alt="Placeholder"
        style="max-width:100%; max-height:80vh; display:block; position:relative; left:0; right:0; top:0; bottom:0; margin:auto; z-index:0;">
    </div>
  `;
  slideNumberInput.value = index;
  localStorage.setItem('step', index);

  // Instructions
  let step = null;
  if (instructionsData.length >= index) {
    step = instructionsData[index - 1];
    if (step) {
      stepTitle.textContent = step.stepTitle || `Step ${index}`;
      stepInstructions.textContent = step.instructions || '';
    } else {
      stepTitle.textContent = `Step ${index}`;
      stepInstructions.textContent = '';
    }
  } else {
    stepTitle.textContent = `Step ${index}`;
    stepInstructions.textContent = '';
  }

  // Modal content and visibility
  const noteModal = document.getElementById('noteModalContent').parentElement;
  const checkModal = document.getElementById('checkModalContent').parentElement;
  const errorModal = document.getElementById('errorModalContent').parentElement;

  // Notes
  if (step && Array.isArray(step.note) && step.note.length > 0) {
    document.getElementById('noteModalContent').innerHTML = step.note.map(n => `<div>${n}</div>`).join('');
    noteModal.style.display = '';
  } else {
    noteModal.style.display = 'none';
  }

  // Checks
  if (step && Array.isArray(step.check) && step.check.length > 0) {
    document.getElementById('checkModalContent').innerHTML = step.check.map(c => `<div>${c}</div>`).join('');
    checkModal.style.display = '';
  } else {
    checkModal.style.display = 'none';
  }

  // Errors
  if (step && Array.isArray(step.error) && step.error.length > 0) {
    document.getElementById('errorModalContent').innerHTML = step.error.map(e => `<div>${e}</div>`).join('');
    errorModal.style.display = '';
  } else {
    errorModal.style.display = 'none';
  }
}

function springyPress(btn) {
  btn.classList.add('springy');
  btn.classList.remove('springy-bounce');
}

function springyRelease(btn) {
  // Remove .springy immediately, then trigger .springy-bounce for the animation
  btn.classList.remove('springy');
  // Force reflow to restart animation if needed
  void btn.offsetWidth;
  btn.classList.add('springy-bounce');
  setTimeout(() => btn.classList.remove('springy-bounce'), 250);
}

// Navigation handlers
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let leftBtnPressed = false;
let rightBtnPressed = false;

leftBtn.addEventListener('mousedown', () => {
  leftBtnPressed = true;
  springyPress(leftBtn);
});
leftBtn.addEventListener('mouseup', () => {
  if (leftBtnPressed) springyRelease(leftBtn);
  leftBtnPressed = false;
});
leftBtn.addEventListener('mouseleave', () => {
  if (leftBtnPressed) springyRelease(leftBtn);
  leftBtnPressed = false;
});
leftBtn.addEventListener('click', () => {
  current = (current - 2 + slides.length) % slides.length + 1;
  renderSlide(current);
});

rightBtn.addEventListener('mousedown', () => {
  rightBtnPressed = true;
  springyPress(rightBtn);
});
rightBtn.addEventListener('mouseup', () => {
  if (rightBtnPressed) springyRelease(rightBtn);
  rightBtnPressed = false;
});
rightBtn.addEventListener('mouseleave', () => {
  if (rightBtnPressed) springyRelease(rightBtn);
  rightBtnPressed = false;
});
rightBtn.addEventListener('click', () => {
  current = (current % slides.length) + 1;
  renderSlide(current);
});

// // Keyboard navigation for left/right arrow keys
// document.addEventListener('keydown', (e) => {
//   if (e.target === slideNumberInput) return;
//   if (e.repeat) return;
//   if (e.key === 'ArrowLeft') {
//     springyPress(leftBtn);
//     current = (current - 2 + slides.length) % slides.length + 1;
//     renderSlide(current);
//   } else if (e.key === 'ArrowRight') {
//     springyPress(rightBtn);
//     current = (current % slides.length) + 1;
//     renderSlide(current);
//   }
// });
// document.addEventListener('keyup', (e) => {
//   if (e.target === slideNumberInput) return;
//   if (e.key === 'ArrowLeft') {
//     springyRelease(leftBtn);
//   } else if (e.key === 'ArrowRight') {
//     springyRelease(rightBtn);
//   }
// });

slideNumberInput.addEventListener('focus', () => {
  usingSlideNumInput = true;
  console.log(usingSlideNumInput)
})

slideNumberInput.addEventListener('blur', () => {
  usingSlideNumInput = false;
    console.log(usingSlideNumInput)
})

slideNumberInput.addEventListener('change', () => {
  const val = parseInt(slideNumberInput.value, 10);
  if (val >= 1 && val <= slides.length) {
    current = val;
    renderSlide(current);
  } else {
    showTooltip("That step doesn't exist!");
    slideNumberInput.value = current;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const toolContainer = document.querySelector('.keyboard-tool-container');
  const toolTab = document.querySelector('.keyboard-tool-tab');
  if (toolContainer && toolTab) {
    toolTab.addEventListener('click', () => {
      toolContainer.classList.toggle('open');
    });
  }
});

// Fetch instructions.json and initialize
fetch('instructions.json')
  .then(res => res.json())
  .then(data => {
    instructionsData = data;
    renderSlide(current);
  })
  .catch(() => {
    instructionsData = [];
    renderSlide(current);
  });


document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('click', () => {
    console.log(`Pressed: ${key.id}`);
    // Add your key functionality here
  });
});

document.addEventListener('keydown', (e) => {
    if(!usingSlideNumInput){
      e.preventDefault()
    }
    if(e.repeat){
      return
    }
    console.log(`Pressed: ${e.code}`);
    document.getElementById(e.code).classList.add("pressed")
  })

document.addEventListener('keyup', (e) => {
  document.getElementById(e.code).classList.remove("pressed")
})