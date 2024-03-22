import { v4 as uuidv4 } from 'uuid'


export function generateId() {
    const currentEpoch = new Date().getTime();
    return String(
      uuidv4().slice(0, -14) +
        ':' +
        currentEpoch.toString()
    )
  }
  