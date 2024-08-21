export enum Milliseconds {
  MILLISECOND = 1,
  SECOND = 1000,
  MINUTE = 60000,
  HOUR = 3600000,
  DAY = 86400000,
  WEEK = 604800000,
  MONTH = 2628000000,
  YEAR = 31540000000
}

export class MillisecondsUtils {
  public static toString(ms: Milliseconds) {
    switch (ms) {
      case Milliseconds.MILLISECOND:
        return 'ms'
      case Milliseconds.SECOND:
        return 's'
      case Milliseconds.MINUTE:
        return 'm'
      case Milliseconds.HOUR:
        return 'h'
      case Milliseconds.DAY:
        return 'd'
      case Milliseconds.WEEK:
        return 'w'
      case Milliseconds.MONTH:
        return 'M'
      case Milliseconds.YEAR:
        return 'Y'
      default:
        return ''
    }
  }
  public static loadMilisecondsToProperValue(time: number) {
    if (time === 0) {
      return {
        timeNumber: 0,
        timeUnit: Milliseconds.MILLISECOND
      }
    }

    if (time % Milliseconds.HOUR === 0) {
      return {
        timeNumber: time / Milliseconds.HOUR,
        timeUnit: Milliseconds.HOUR
      }
    } else if (time % Milliseconds.MINUTE === 0) {
      return {
        timeNumber: time / Milliseconds.MINUTE,
        timeUnit: Milliseconds.MINUTE
      }
    } else if (time % Milliseconds.SECOND === 0) {
      return {
        timeNumber: time / Milliseconds.SECOND,
        timeUnit: Milliseconds.SECOND
      }
    } else {
      return {
        timeNumber: time,
        timeUnit: Milliseconds.MILLISECOND
      }
    }
  }
}
