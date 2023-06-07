// This is needed to make TypeScript happy when importing chess.js
declare module 'chess.js' {
    const Chess: any
    export = Chess
}
