export default class CircleSliderState {
  /*
   */
  constructor (steps, offset, initialValue, maxArcLength) {
    this.steps = steps
    this.offset = offset
    this.currentStepIndex = 0
    for (let stepIndex in this.steps) {
      if (this.steps[stepIndex] === initialValue) {
        this.currentStepIndex = stepIndex
        break
      }
    }
    this.firstStep = this.steps[0]
    this.length = this.steps.length - 1
    this.lastStep = this.steps[this.length]
    this.maxArcLength = maxArcLength
  }

  /*
   */
  get angleUnit () {
    return (this.maxArcLength - this.offset) / this.length
  }

  /*
   */
  get angleValue () {
    return (Math.min(
      this.offset + this.angleUnit * this.currentStepIndex,
      this.maxArcLength - Number.EPSILON
    )) - 0.00001 // correct for 100% value
  }

  /*
   */
  get currentStep () {
    return this.steps[this.currentStepIndex]
  }

  /*
   */
  updateCurrentStepFromValue (value) {
    for (let i = 0; i < this.length; i++) {
      if (value <= this.steps[i]) {
        this.currentStepIndex = i
        return
      }
    }

    this.currentStepIndex = this.length
  }

  /*
   */
  updateCurrentStepFromAngle (angle) {
    const stepIndex = Math.round((angle - this.offset) / this.angleUnit)
    this.currentStepIndex = Math.min(Math.max(stepIndex, 0), this.length)
  }
}
