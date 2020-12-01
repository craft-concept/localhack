import ts from "typescript"
import * as T from "../convert.mjs"
import { reify } from "../edit.mjs"

const createProgram = ts.createSemanticDiagnosticsBuilderProgram

export const compilerOptions = () => ({
  strictNullChecks: true,
  allowJs: true,
  // "checkJs": true,
  lib: ["es2019", "dom", "es2015"],
  target: "es2017",
  module: "es2020",
  moduleResolution: "node",
  jsx: "react",
  jsxFactory: "h",
  outDir: "build/ts",
  plugins: [{ name: "typescript-lit-html-plugin" }],
})

function reportDiagnostic(diag: ts.Diagnostic) {
  console.error(
    "Error",
    diag.code,
    ":",
    // ts.flattenDiagnosticMessageText(diag.messageText, formatHost.getNewLine()),
  )
}

/**
 * Prints a diagnostic every time the watch status changes.
 * This is mainly for messages like "Starting compilation" or "Compilation completed".
 */
function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  // console.info(ts.formatDiagnostic(diagnostic, formatHost))
}

export const compiler = input => state => {
  const { typescript } = reify(state, {
    typescript: T.Object,
  })

  typescript.host ??= ts.createWatchCompilerHost(
    [],
    compilerOptions(),
    ts.sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged,
  )

  typescript.watch ??= ts.createWatchProgram(typescript.host)
}

// export const configFileCompiler = () => {
//   const configPath = ts.findConfigFile("./", ts.sys.fileExists, "tsconfig.json")
//   if (!configPath) throw new Error("Could not find 'tsconfig.json'.")

//   const host = ts.createWatchCompilerHost(
//     configPath,
//     {},
//     ts.sys,
//     createProgram,
//     reportDiagnostic,
//     reportWatchStatusChanged,
//   )

//   ts.createWatchProgram(host)
// }

// Todo: Use for transforming source
// const compiler = () => {
//   function visitor(ctx, sourceFile) {
//     const visitor = node => {
//       // here we can check each node and potentially return
//       // new nodes if we want to leave the node as is, and
//       // continue searching through child nodes:
//       return ts.visitEachChild(node, visitor, ctx)
//     }
//     return visitor
//   }

//   return ctx => sourceFile => ts.visitNode(sourceFile, visitor(ctx, sourceFile))
// }
