# GNAP's Chess Game

A Chess game application built with React, Chessboardjsx and Stockfish, with options to play against an AI or a friend in multiplayer mode. It uses Firebase for the backend to handle multiplayer games.

## Features

-   Play against an AI or a friend in multiplayer mode.
-   AI difficulty level can be adjusted.
-   Undo previous moves (in AI mode).
-   Live update of captured pieces.
-   Visual feedback for available piece moves.
-   Hosted games with unique IDs (in Multiplayer mode).

## Installation

You need Node.js and npm installed on your machine. Clone this repository and install dependencies.

```bash
git clone https://github.com/graphicnapkin/chess.git
cd chess
npm install
```

## Configuration

This project uses Firebase for managing multiplayer games. Please setup your Firebase project and copy your Firebase SDK snippet to a new `.env` file. Refer to `TBI` for the required format.

## Running the application

After installation and configuration, run the development server:

```bash
npm start
```

Your application should now be running on [http://localhost:9000](http://localhost:9000).

## Application Structure

The application contains several components:

-   **App.tsx:** This is the main component of the application. It manages the game settings, displays the chess board and controls, and coordinates the interaction between the game logic and the Firebase database.

-   **useChessGame.tsx:** This hook manages the state of the game using the chess.js library. It updates the game after each move, checks the game status, and handles user interaction such as highlighting potential moves and undoing moves.

-   **useStockfishWorker.tsx:** This hook manages the communication between the Stockfish chess engine running in a web worker and the game. It interprets the chess engine's output and updates the game accordingly.

The application also contains several smaller components:

-   **Chessboard:** This component displays the current state of the game and allows players to make moves.
-   **CapturedPieces:** This component displays the pieces that have been captured so far in the game.
-   **Controls:** This component allows players to undo moves, reset the game, and change settings such as the AI difficulty, the player's color, and the game type.
-   **InfoDisplay:** This component displays the current game status.

## Future Improvements

The following improvements are planned:

-   Implement a timer.
-   Hide difficulty setting when gameType is multiplayer.
-   Instead of auto promoting to a queen, allow the user to select the piece to promote to.
-   Add authentication through Firebase for the game and the database.
-   Restrict access to the database to only allow authenticated users to make changes.
-   Restrict access to the database to only allow the two players to make changes to a given game.
-   Better styling for potential moves.

## Contributions

Feel free to fork this project and make contributions. For any major changes, please open an issue first to discuss the proposed changes.

## License

MIT License

## Author

This project is authored by [Graphicnapkin](https://github.com/graphicnapkin). For any questions, feel free to open an issue on GitHub or contact the author.
Yes, I did use chatGPT to write this Readme.md (and a good amount of the initial app code.
