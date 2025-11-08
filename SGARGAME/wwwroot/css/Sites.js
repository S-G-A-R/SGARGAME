window.playEntrance = function () {
    const logo = document.getElementById('gameLogo');
    const btn = document.getElementById('startBtn');
    if (logo) logo.style.visibility = 'visible';
    if (btn) {
        btn.style.opacity = '0';
        setTimeout(() => {
            btn.style.transition = 'opacity 500ms ease';
            btn.style.opacity = '1';
        }, 220);
    }
};

window.playStartClick = function (dotNetRef) {
    const startBtn = document.getElementById('startBtn');
    const startScreen = document.getElementById('startScreen');
    const logo = document.getElementById('gameLogo');

    if (!startBtn || !startScreen) {
        dotNetRef?.invokeMethodAsync('OnStartAnimationComplete');
        return;
    }

    // Efecto de clic (ripple)
    const rect = startBtn.getBoundingClientRect();
    const circle = document.createElement('span');
    circle.classList.add('ripple');

    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = size + 'px';

    const x = rect.width / 2 - size / 2;
    const y = rect.height / 2 - size / 2;
    circle.style.left = x + 'px';
    circle.style.top = y + 'px';
    circle.style.background = 'rgba(255,255,255,0.3)';

    startBtn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);

    // Animaciones de salida
    if (logo) {
        logo.style.transition = 'transform 360ms ease, opacity 360ms ease';
        logo.style.transform = 'scale(0.95)';
        logo.style.opacity = '0.9';
    }
    startBtn.style.transition = 'transform 380ms ease, opacity 380ms ease';
    startBtn.style.transform = 'translateY(6px) scale(0.98)';

    setTimeout(() => {
        startScreen.classList.add('fade-out');
        setTimeout(() => {
            dotNetRef?.invokeMethodAsync('OnStartAnimationComplete');
        }, 520);
    }, 220);
};
