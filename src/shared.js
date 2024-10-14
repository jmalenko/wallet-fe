// Done

export function doneContains(array, element) {
  for (let i = 0; i < array.length; i++) {
    const el2 = array[i];
    if (
      element.predmet == el2.predmet &&
      element.trida == el2.trida &&
      element.cviceni == el2.cviceni
    )
      return true;
  }
  return false;
}
