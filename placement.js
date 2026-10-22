/* Regras de manipulação independentes do renderizador. Unidades em mm. */
'use strict';
class HardwarePlacement {
  constructor() { this.cancel(); }
  begin(id, home, tolerance, missing = []) {
    this.id = id;
    this.home = { ...home };
    this.position = { x: home.x - 170, z: home.z };
    this.tolerance = tolerance;
    this.missing = [...missing];
    this.turns = 0;
  }
  move(x, z) {
    if (this.id && Number.isFinite(x) && Number.isFinite(z)) {
      this.position = { x: Math.max(-480, Math.min(480, x)), z: Math.max(-450, Math.min(450, z)) };
    }
  }
  rotate(direction) { if (this.id) this.turns = ((this.turns + direction) % 4 + 4) % 4; }
  state() {
    if (!this.id) return { id: null, canPlace: false, reason: 'Escolha uma peça na biblioteca.' };
    const distance = Math.hypot(this.position.x - this.home.x, this.position.z - this.home.z);
    const reason = this.missing.length ? 'Antes, instale: ' + this.missing.join(', ') + '.'
      : this.turns !== 0 ? 'Orientação incorreta. Gire com Q / E.'
      : distance > this.tolerance ? 'Leve a peça até o contorno do encaixe.'
      : 'Alinhado. Clique para encaixar.';
    return { id: this.id, canPlace: !this.missing.length && this.turns === 0 && distance <= this.tolerance,
      reason, distance, degrees: this.turns * 90, x: this.position.x, z: this.position.z, target: { ...this.home } };
  }
  cancel() { this.id = null; this.turns = 0; this.missing = []; }
}
if (typeof module !== 'undefined') module.exports = HardwarePlacement;
