export class Entity {
  constructor () {
    this.id = Math.random().toString().replace(/\D/g, '')
  }

  update (dt) {
    // just empty function
  }
}
