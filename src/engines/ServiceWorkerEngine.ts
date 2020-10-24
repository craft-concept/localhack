import * as Path from "path"
import {
  Engine,
  map,
  push,
  Update,
  toggle,
  always,
  identity,
  index,
} from "../lib"

export interface Notification {
  tag: string
}

export type Action =
  | { type: "SomethingHappened" }
  | { type: "SyncHappened" }
  | { type: "NotificationClicked"; notification: Notification }
  | { type: "NotificationClosed"; notification: Notification }

export interface State {}

export const update: Update<Action, State> = action => {
  switch (action.type) {
    case "SomethingHappened":
      return identity

    default:
      return identity
  }
}

export const engine: Engine<Action, State> = dispatch => {
  self.addEventListener("sync", onSync)
  self.addEventListener("fetch", onFetch)
  self.addEventListener("notificationclick", onNotificationClick)
  self.addEventListener("notificationclose", onNotificationClose)

  return state => {}

  function onSync(evt: any) {
    dispatch({ type: "SyncHappened" })
  }

  function onFetch(evt: any) {
    dispatch({ type: "SyncHappened" })
  }

  function onNotificationClick(evt: any) {
    dispatch({ type: "NotificationClicked", notification: evt.notification })
  }

  function onNotificationClose(evt: any) {
    dispatch({ type: "NotificationClosed", notification: evt.notification })
  }
}
