const { Observable, operators, fromEvent } = rxjs;

const textbox = document.querySelector("#text");
const keypresses = fromEvent(textbox, "keypress");

const results = document.querySelector("#results");

const searchBtn = document.querySelector("#search");

const closeBtn = document.querySelector("#close");

const getWikiResults = (term) => {
  return Observable.create((observer) => {
    let cancelled = false;
    const url =
      "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" +
      encodeURIComponent(term) +
      "&callback=?";

    $.getJSON(url, (data) => {
      if (!cancelled) {
        if (data[1] && data[1].length) {
          observer.next(data[1]);
        }
        observer.complete();
      }
    });

    return () => {
      cancelled = true;
    };
  });
};

const searchBtnClicks = fromEvent(searchBtn, "click");

const searchBtnOpens = searchBtnClicks.pipe(
  operators.tap(() => {
    document.querySelector("#form").style.display = "block";
  })
);

const resultSets = searchBtnOpens.pipe(
  operators.flatMap(() => {
    const closeClicks$ = rxjs.fromEvent(closeBtn, "click");
    const searchFromCloses$ = closeClicks$.pipe(
      operators.tap(() => {
        document.querySelector("#form").style.display = "none";
      })
    );

    return keypresses.pipe(
      operators.debounceTime(20),
      operators.distinctUntilKeyChanged("key"),
      operators.filter(() => textbox.value.trim().length > 0),
      operators.switchMap(() =>
        getWikiResults(textbox.value.trim()).pipe(operators.retry(3))
      ),
      operators.takeUntil(searchFromCloses$)
    );
  })
);

resultSets.forEach((res) => {
  console.log(res);
  results.value = JSON.stringify(res);
});
