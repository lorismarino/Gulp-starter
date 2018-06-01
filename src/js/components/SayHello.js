class SayHello {
  constructor (name) {
    this.name = name
    this.sayHello()
  }

  sayHello () {
    console.log(`Hello ${this.name}`)
  }
}

export default SayHello
