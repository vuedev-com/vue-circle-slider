import {cloneDeep} from 'lodash'

import {CircleSlider} from './CircleSlider'
let child = cloneDeep(CircleSlider)
child.props.limitMin = {
  type: Number,
  required: false,
  default: null
}
child.props.limitMax= {
  type: Number,
  required: false,
  default: null
}
child.methods.updateAngle = function (angle) {
  this.circleSliderState.updateCurrentStepFromAngle(angle)
  this.currentStepValue = this.circleSliderState.currentStep
  if (this.currentStepValue <= this.limitMax
      && this.currentStepValue >= this.limitMin)
  {
    this.angle = this.circleSliderState.angleValue
    this.$emit('input', this.currentStepValue)
  }
}
export default child
