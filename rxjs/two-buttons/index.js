/**
 * Creates a stream of button clicks which return the text value of the button
 */
const createBtnClicks$ = (btn) =>
  rxjs.fromEvent(btn, "click").pipe(rxjs.operators.map(() => btn.innerText));

/**
 * Sums 2 values
 */
const sum = (a, b) => a + b;

/**
 * Creates a counting stream
 */
const createCounter$ = (stream$) =>
  stream$.pipe(rxjs.operators.mapTo(1), rxjs.operators.scan(sum, 0));

// Setup button streams ---
const primaryClicks$ = createBtnClicks$(document.querySelector(".btn-primary"));
const secondaryClicks$ = createBtnClicks$(
  document.querySelector(".btn-secondary")
);

const primaryClickCounts$ = createCounter$(primaryClicks$);
const secondaryClickCounts$ = createCounter$(secondaryClicks$);

// Merge all button streams and combine the counts ---
const btnClick$s = rxjs
  .zip(primaryClicks$, primaryClickCounts$)
  .pipe(
    rxjs.operators.merge(rxjs.zip(secondaryClicks$, secondaryClickCounts$))
  );

// Print the result ---
const alertDialog = document.querySelector(".alert");
btnClick$s.forEach(([btnName, btnCount]) => {
  alertDialog.innerText = `Clicked the ${btnName} button ${btnCount} times`;
});
