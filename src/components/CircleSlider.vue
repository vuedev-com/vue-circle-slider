<template>
  <div>
    <svg :width="side + 'px'" :height="side + 'px'" :viewBox="'0 0 ' + side + ' ' + side" ref="_svg"
      @touchmove="handleTouchMove"
      @click="handleClick"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
    >
      <g>
        <path :stroke="circleColor" fill="none" :stroke-width="cpMainCircleStrokeWidth" :d="cpPathD(cpStartX, cpStartY, cpEndX, cpEndY, 1, 1)"></path>
        <path :stroke="progressColor" fill="none" :stroke-width="cpPathStrokeWidth" :d="cpPathD(cpOriginX, cpOriginY, cpPathX, cpPathY, cpPathLongArc, cpPathDirection)"></path>
        <circle :fill="knobColor" :r="cpKnobRadius" :cx="cpPathX" :cy="cpPathY"></circle>
      </g>
    </svg>
  </div>
</template>
<script>
import TouchPosition from '../modules/touch_position.js'
import CircleSliderState from '../modules/circle_slider_state.js'
export default {
  name: 'CircleSlider',
  created () {
    this.stepsCount = 1 + (this.max - this.min) / this.stepSize
    this.steps = Array.from({
      length: this.stepsCount
    }, (_, i) => this.min + i * this.stepSize)

    this.circleSliderState = new CircleSliderState(this.steps, 0, this.value, this.arcLengthRadians)
    this.angle = this.circleSliderState.angleValue
    this.currentStepValue = this.circleSliderState.currentStep

    this.originValue = this.origin === null ? this.min : this.origin
    this.originValue = Math.min(this.max, Math.max(this.min, this.originValue))

    this.updateFromPropValue(this.value)
  },

  mounted () {
    this.touchPosition = new TouchPosition(this.$refs._svg, this.radius, this.radius / 2)
  },
  props: {
    value: {
      type: Number,
      required: false,
      default: 0
    },
    side: {
      type: Number,
      required: false,
      default: 100
    },
    stepSize: {
      type: Number,
      required: false,
      default: 1
    },
    min: {
      type: Number,
      required: false,
      default: 0
    },
    max: {
      type: Number,
      required: false,
      default: 100
    },
    circleColor: {
      type: String,
      required: false,
      default: '#334860'
    },
    progressColor: {
      type: String,
      required: false,
      default: '#00be7e'
    },
    knobColor: {
      type: String,
      required: false,
      default: '#00be7e'
    },
    knobRadius: {
      type: Number,
      required: false,
      default: null
    },
    knobRadiusRel: {
      type: Number,
      required: false,
      default: 7
    },
    circleWidth: {
      type: Number,
      required: false,
      default: null
    },
    circleWidthRel: {
      type: Number,
      required: false,
      default: 20
    },
    progressWidth: {
      type: Number,
      required: false,
      default: null
    },
    progressWidthRel: {
      type: Number,
      required: false,
      default: 10
    },
    arcLengthDegrees: {
      type: Number,
      required: false,
      default: 360
    },
    arcOffsetDegrees: {
      type: Number,
      required: false,
      default: 0
    },
    origin: {
      type: Number,
      required: false,
      default: null
    }
    // limitMin: {
    //   type: Number,
    //   required: false,
    //   default: null
    // },
    // limitMax: {
    //   type: Number,
    //   required: false,
    //   default: null
    // }
  },
  data () {
    return {
      originValue: null,
      steps: null,
      stepsCount: null,
      angle: 0,
      currentStepValue: 0,
      mousePressed: false,
      circleSliderState: null,
      mousemoveTicks: 0
    }
  },
  computed: {
    // cpStartAngleOffset () {
    //   if (!this.minStepLimit) {
    //     return 0
    //   }
    // },
    cpCenter () {
      return this.side / 2
    },
    cpAngle () {
      return this.angle + this.arcOffsetRadians
    },
    cpMainCircleStrokeWidth () {
      return this.circleWidth || (this.side / 2) / this.circleWidthRel
    },
    cpPathLongArc() {
      return (this.cpAngle < Math.PI + this.arcOffsetRadians) ? 0 : 1
    },
    cpPathDirection() {
      return (this.cpAngle < this.cpOriginRadians + this.arcOffsetRadians) ? 0 : 1
    },
    cpStartX() {
      return this.pathX(this.arcOffsetRadians)
    },
    cpStartY() {
      return this.pathY(this.arcOffsetRadians)
    },
    cpEndX() {
      return this.pathX((this.arcLengthRadians+this.arcOffsetRadians)*.99999)
    },
    cpEndY() {
      return this.pathY((this.arcLengthRadians+this.arcOffsetRadians)*.99999)
    },
    cpOriginRadians() {
      return this.circleSliderState.angleUnit * (this.originValue - this.min)
    },
    cpOriginX() {
      return this.pathX(this.arcOffsetRadians + this.cpOriginRadians)
    },
    cpOriginY() {
      return this.pathY(this.arcOffsetRadians + this.cpOriginRadians)
    },
    cpPathX () {
      return this.cpCenter + this.radius * Math.cos(this.cpAngle)
    },
    cpPathY () {
      return this.cpCenter + this.radius * Math.sin(this.cpAngle)
    },
    cpPathStrokeWidth () {
      return this.progressWidth || (this.side / 2) / this.progressWidthRel
    },
    cpKnobRadius () {
      return this.knobRadius || (this.side / 2) / this.knobRadiusRel
    },
    radius() {
      let maxCurveWidth = Math.max(this.cpMainCircleStrokeWidth, this.cpPathStrokeWidth)
      return (this.side / 2) - Math.max(maxCurveWidth, this.cpKnobRadius * 2) / 2
    },
    arcLengthRadians() {
      return this.arcLengthDegrees * Math.PI * 2 / 360
    },
    arcOffsetRadians() {
      return this.arcOffsetDegrees * Math.PI * 2 / 360
    }
  },
  methods: {

    cpPathD (startX, startY, endX, endY, longArc, direction) {
      let parts = []
      parts.push('M' + startX)
      parts.push(startY)
      parts.push('A')
      parts.push(this.radius)
      parts.push(this.radius)
      parts.push(0)
      parts.push(longArc)
      parts.push(direction)
      parts.push(endX)
      parts.push(endY)
      return parts.join(' ')
    },

    pathX (angle) {
      return this.cpCenter + this.radius * Math.cos(angle)
    },

    pathY (angle) {
      return this.cpCenter + this.radius * Math.sin(angle)
    },

    /*
     */
    fitToStep (val) {
      return Math.round(val / this.stepSize) * this.stepSize
    },

    /*
     */
    handleClick (e) {
      this.touchPosition.setNewPosition(e)
      if (this.touchPosition.isTouchWithinSliderRange) {
        const newAngle = this.touchPosition.sliderAngle
        this.animateSlider(this.angle, newAngle)
      }
    },

    /*
     */
    handleMouseDown (e) {
      e.preventDefault()
      this.mousePressed = true
      window.addEventListener('mousemove', this.handleWindowMouseMove)
      window.addEventListener('mouseup', this.handleMouseUp)
    },

    /*
     */
    handleMouseUp (e) {
      e.preventDefault()
      this.mousePressed = false
      window.removeEventListener('mousemove', this.handleWindowMouseMove)
      window.removeEventListener('mouseup', this.handleMouseUp)
      this.mousemoveTicks = 0
    },

    /*
     */
    handleWindowMouseMove (e) {
      e.preventDefault()
      if (this.mousemoveTicks < 5) {
        this.mousemoveTicks++
        return
      }

      this.touchPosition.setNewPosition(e)
      this.updateSlider()
    },

    /*
     */
    handleTouchMove (e) {
      this.$emit('touchmove')
      // Do nothing if two or more fingers used
      if (e.targetTouches.length > 1 || e.changedTouches.length > 1 || e.touches.length > 1) {
        return true
      }

      const lastTouch = e.targetTouches.item(e.targetTouches.length - 1)
      this.touchPosition.setNewPosition(lastTouch)

      if (this.touchPosition.isTouchWithinSliderRange) {
        e.preventDefault()
        this.updateSlider()
      }
    },

    /*
     */
    updateAngle (angle) {
      this.circleSliderState.updateCurrentStepFromAngle(angle)
      this.angle = this.circleSliderState.angleValue
      this.currentStepValue = this.circleSliderState.currentStep

      this.$emit('input', this.currentStepValue)
    },

    /*
     */
    updateFromPropValue (value) {
      let stepValue = this.fitToStep(value)
      this.circleSliderState.updateCurrentStepFromValue(stepValue)

      this.angle = this.circleSliderState.angleValue
      this.currentStepValue = stepValue
      this.$emit('input', this.currentStepValue)
    },

    /*
     */
    updateSlider () {
      const angle = (this.touchPosition.sliderAngle - this.arcOffsetRadians + Math.PI * 2) % (Math.PI * 2)
      if (Math.abs(this.angle - angle) < Math.PI) {
        this.updateAngle(Math.max( 0, Math.min(angle, this.arcLengthRadians)))
      }
    },

    /*
     */
    animateSlider (startAngle, endAngle) {
      const direction = startAngle < endAngle ? 1 : -1
      const curveAngleMovementUnit = direction * this.circleSliderState.angleUnit * 2

      const animate = () => {
        if (Math.abs(endAngle - startAngle) < Math.abs(2 * curveAngleMovementUnit)) {
          this.updateAngle(endAngle)
        } else {
          const newAngle = startAngle + curveAngleMovementUnit
          this.updateAngle(newAngle)
          this.animateSlider(newAngle, endAngle)
        }
      }

      window.requestAnimationFrame(animate)
    }
  },
  watch: {
    value (val) {
      this.updateFromPropValue(val)
    }
  }
}
</script>
