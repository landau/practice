const { Observable, operators, fromEvent } = rxjs;

const formatLeadingZero = (n) => (n > 9 ? `${n}` : `0${n}`);

const formatTime = (ms) => {
  const min = parseInt(ms / 1000 / 60, 10);
  const sec = parseInt((ms / 1000) % 60, 10);
  return `${min}:${formatLeadingZero(sec)}`;
};

const START_TIME = 1000 * 60 * 5;
const INTERVAL = 1000;

const BUTTON_CLASSES = {
  PRIMARY: "btn-primary",
  SECONDARY: "btn-secondary",
};

const [timer, startBtn, stopBtn] = [
  "#timer",
  "#start-btn",
  "#stop-btn",
].map((s) => document.querySelector(s));

const startBtnClicks$ = fromEvent(startBtn, "click");
timer.innerText = formatTime(START_TIME);

const enableButton = (btn1, btn2) => {
  btn1.classList.add(BUTTON_CLASSES.PRIMARY);
  btn1.classList.remove(BUTTON_CLASSES.SECONDARY);
  btn2.classList.add(BUTTON_CLASSES.SECONDARY);
  btn2.classList.remove(BUTTON_CLASSES.PRIMARY);
};

const countDownTimer$ = startBtnClicks$.pipe(
  operators.tap(() => {
    enableButton(stopBtn, startBtn);
  }),
  operators.flatMap(() => {
    const stopBtnClicks$ = fromEvent(stopBtn, "click");

    // TODO: How to store this such that the timer won't start over
    return rxjs.interval(INTERVAL).pipe(
      operators.takeUntil(
        stopBtnClicks$.pipe(
          // In a real world app, this would be a bad place to introduce
          // side effects
          operators.tap(() => {
            enableButton(startBtn, stopBtn);
          })
        )
      ),
      // Subtract n seconds from the start time
      // Use n+1 here because the interval doesn't kick off until after 1 sec
      operators.map((n) => START_TIME - (n + 1) * 1000),
      operators.takeWhile((ms) => ms >= 0)
    );
  })
);

countDownTimer$.subscribe({
  next: (ms) => {
    timer.innerText = formatTime(ms);
  },
  complete: () => {
    // FIXME: This is not being triggered for some reason
    // It should fire after the takeWhile condition is met
    console.log("complete");
    enableButton(startBtn, stopBtn);
  },
});
