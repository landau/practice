// const { Observable, operators, fromEvent } = rxjs;

const noop = () => {};

class Observable {
  constructor(forEach) {
    this._forEach = forEach;
  }

  forEach(next, error = noop, complete = noop) {
    // 2 ways to call forEach next as function or object
    const observable =
      typeof next === "function" ? { next, error, complete } : next;

    return this._forEach(observable);
  }

  map(projectionFn) {
    return new Observable((observer) =>
      this.forEach(
        (v) => observer.next(projectionFn(v)),
        observer.error,
        observer.complete
      )
    );
  }

  filter(predicateFn) {
    return new Observable((observer) =>
      this.forEach(
        (v) => (predicateFn(v) ? observer.next(v) : null),
        observer.error,
        observer.complete
      )
    );
  }

  take(n) {
    return new Observable((observer) => {
      let i = 0;
      const sub = this.forEach(
        (v) => {
          observer.next(v);
          i++;

          if (i === n) {
            observer.complete();
            sub.dispose();
          }
        },
        observer.error,
        observer.complete
      );

      return sub;
    });
  }

  static fromEvent(dom, eventName) {
    return new Observable((observer) => {
      const handler = (e) => observer.next(e);
      dom.addEventListener(eventName, handler);

      // Subscription
      return {
        dispose() {
          dom.removeEventListener(eventName, handler);
        },
      };
    });
  }
}

const clicks$ = Observable.fromEvent(document.getElementById("button"), "click")
  .filter((e) => e.pageX > 40)
  .map((e) => e.pageX + "px")
  .take(5);

clicks$.forEach((v) => console.log(v));
