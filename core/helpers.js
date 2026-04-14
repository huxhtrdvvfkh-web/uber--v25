function dist(a, b) {
  if (!a || !b) return 999;
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}

function score(distance, load, speed) {
  return (1 / (distance + 1)) + speed * 0.25 - load * 0.12;
}

function etaCalc(distance, speed = 1) {
  return Math.max(1, Math.round(distance * 0.25 / speed));
}

module.exports = { dist, score, etaCalc };