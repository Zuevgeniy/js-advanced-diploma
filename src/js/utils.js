export function calcTileType(index, boardSize) {
  let res = '';
  const i = index + 1;
  if (i <= boardSize) res += 'top-';
  if (i > boardSize ** 2 - boardSize) res += 'bottom-';
  switch (i % boardSize) {
    case 0: res += 'right'; break;
    case 1: res += 'left'; break;
    default: res = res.slice(0, -1); break;
  }
  if (res !== '') return res;
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
