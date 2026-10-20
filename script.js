// 修改这份对象中的文字，即可调整三个演示状态。
const moments = {
  pickup: { number: '01', title: '拿起', en: 'Pick up', description: '筷子安静地放在木托盘上。准备好，开始属于自己的一餐。', hint: '点击「使用」，或拖动筷子，开始体验。' },
  use: { number: '02', title: '使用', en: 'Use', description: '拿起筷子，享用这一餐。需要停一停时，把筷子移到碗侧的凹槽。', hint: '将筷子拖到标有 REST HERE 的凹槽，或点击「搁置」。' },
  rest: { number: '03', title: '搁置', en: 'Rest', description: '筷子落在碗侧凹槽上。用餐间隙，有一个安放餐具的位置。', hint: '筷子已搁置在凹槽上。点击「重新体验」返回初始状态。' }
};
const scene = document.querySelector('#scene');
const sticks = document.querySelector('#chopsticks');
const groove = document.querySelector('#drop-zone');
let currentMoment = 'pickup';
function setMoment(key) {
  const item = moments[key];
  currentMoment = key;
  scene.dataset.state = key;
  document.querySelector('#step-number').textContent = item.number;
  document.querySelector('#scene-index').textContent = `${item.number} / 03`;
  const title = document.querySelector('#state-title');
  title.replaceChildren(document.createTextNode(item.title + ' '));
  const english = document.createElement('em');
  english.textContent = item.en;
  title.append(english);
  document.querySelector('#state-description').textContent = item.description;
  document.querySelector('#scene-instruction').textContent = item.hint;
  document.querySelector('#scenario-status').textContent = `当前状态：${item.title}。${item.description}`;
  document.querySelectorAll('[data-state]').forEach(button => {
    if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.state === key));
  });
}
document.querySelectorAll('button[data-state]').forEach(button => button.addEventListener('click', () => setMoment(button.dataset.state)));
document.querySelector('#reset').addEventListener('click', () => setMoment('pickup'));
let drag = null;
let suppressClick = false;
sticks.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  drag = { x: event.clientX, y: event.clientY, moved: false };
  sticks.setPointerCapture(event.pointerId);
});
sticks.addEventListener('pointermove', event => {
  if (!drag) return;
  if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5 && !drag.moved) return;
  drag.moved = true;
  scene.classList.add('dragging');
  const bounds = scene.getBoundingClientRect();
  const x = Math.max(0, Math.min(bounds.width - sticks.offsetWidth, event.clientX - bounds.left - sticks.offsetWidth / 2));
  const y = Math.max(0, Math.min(bounds.height - sticks.offsetHeight, event.clientY - bounds.top - sticks.offsetHeight / 2));
  sticks.style.left = `${x}px`;
  sticks.style.top = `${y}px`;
});
function finishDrag(event, cancelled = false) {
  if (!drag) return;
  const moved = drag.moved;
  drag = null;
  scene.classList.remove('dragging');
  sticks.style.left = '';
  sticks.style.top = '';
  if (!moved) return;
  suppressClick = true;
  if (!cancelled) {
    const bounds = groove.getBoundingClientRect();
    const onGroove = event.clientX >= bounds.left - 35 && event.clientX <= bounds.right + 35 && event.clientY >= bounds.top - 40 && event.clientY <= bounds.bottom + 40;
    setMoment(onGroove ? 'rest' : 'use');
  }
  setTimeout(() => { suppressClick = false; }, 0);
}
sticks.addEventListener('pointerup', event => finishDrag(event));
sticks.addEventListener('pointercancel', event => finishDrag(event, true));
sticks.addEventListener('click', () => {
  if (suppressClick) return;
  setMoment(currentMoment === 'pickup' ? 'use' : currentMoment === 'use' ? 'rest' : 'pickup');
});
setMoment('pickup');
// 本地视频只生成临时浏览器地址，不上传文件。
const picker = document.querySelector('#video-file');
const video = document.querySelector('#video');
const placeholder = document.querySelector('#video-placeholder');
const status = document.querySelector('#video-status');
let localVideoUrl;
picker.addEventListener('change', () => {
  const file = picker.files[0];
  if (!file) return;
  if (!file.type.startsWith('video/')) { status.textContent = '请选择视频文件，例如 MP4 或 WebM。'; return; }
  video.pause();
  if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
  localVideoUrl = URL.createObjectURL(file);
  video.src = localVideoUrl;
  video.hidden = false;
  placeholder.hidden = true;
  status.textContent = '视频已载入，请点击播放。';
});
video.addEventListener('playing', () => { status.textContent = ''; });
video.addEventListener('error', () => { status.textContent = '此格式无法播放，请尝试 H.264 编码的 MP4。'; });
document.querySelector('#year').textContent = new Date().getFullYear();
window.addEventListener('pagehide', event => { if (!event.persisted && localVideoUrl) URL.revokeObjectURL(localVideoUrl); });
