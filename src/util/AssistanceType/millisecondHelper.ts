export enum EMilliseconds {
  MILLISECOND = 1,
  SECOND = 1000,
  MINUTE = 60000,
  HOUR = 3600000,
  DAY = 86400000,
  WEEK = 604800000,
  MONTH = 2628000000,
  YEAR = 31540000000
}

export class CMillisecondsUtils {
  public static toString(ms: EMilliseconds) {
    switch (ms) {
      case EMilliseconds.MILLISECOND:
        return 'ms'
      case EMilliseconds.SECOND:
        return 's'
      case EMilliseconds.MINUTE:
        return 'm'
      case EMilliseconds.HOUR:
        return 'h'
      case EMilliseconds.DAY:
        return 'd'
      case EMilliseconds.WEEK:
        return 'w'
      case EMilliseconds.MONTH:
        return 'M'
      case EMilliseconds.YEAR:
        return 'Y'
      default:
        return ''
    }
  }
  public static loadMilisecondsToProperValue(time: number) {
    if (time === 0) {
      return {
        timeNumber: 0,
        timeUnit: EMilliseconds.MILLISECOND
      }
    }

    if (time % EMilliseconds.HOUR === 0) {
      return {
        timeNumber: time / EMilliseconds.HOUR,
        timeUnit: EMilliseconds.HOUR
      }
    } else if (time % EMilliseconds.MINUTE === 0) {
      return {
        timeNumber: time / EMilliseconds.MINUTE,
        timeUnit: EMilliseconds.MINUTE
      }
    } else if (time % EMilliseconds.SECOND === 0) {
      return {
        timeNumber: time / EMilliseconds.SECOND,
        timeUnit: EMilliseconds.SECOND
      }
    } else {
      return {
        timeNumber: time,
        timeUnit: EMilliseconds.MILLISECOND
      }
    }
  }
}
