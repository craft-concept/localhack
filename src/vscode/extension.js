import * as vscode from "vscode"

export function activate(context) {
  console.log("LocalHack has been activated.")

  let disposable = vscode.commands.registerCommand(
    "localhack.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello from LocalHack!")
    },
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
