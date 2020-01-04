Computer program that plays TicTacToe game, Instead of using traditional approach, This program is developed using Reinforcement Learning in AI. Naturally trains itself like humans do and never losses a Game.

--
Initialization:
As part of game state initialization the program fetches all possible states of the board and assigns these values (0 - Loss/Draw, 1 - win, 0.5 - non-decisive state) for each player across all the game states.

Game Training Phase:
Agent Player 1 and Agent Player 2 play against each other (epochs = 10000) and with every game progression the Value vector is updated with new probabilities for all the game states, learning rate is used as tuning parameter.
After iterating through all the epochs (Training Phase) we obtain the final Value vector for both Agents which will be used when played against humans (Testing phase).


-- Debug questions

The function get_state_hash_and_winner() is only used for training purposes to fetch all possible state values of a board. 
The function get_state_hash_and_winner() executes backwards for all possible states starting from (2,2)  after that position it will recursively assign the postion to (2,1) and call itself and then it will traverse to position (2,2) and starting executing the get_state code for possible combinations(empty, X, O).....continuing the pattern next iteration would be (2,0) traversing to (2,2) and getting states of all possible combinations in between.
Get_state() is to calculate hash value for each state.
InitialVx and InitialVo is basically mapping the states from get_state_hash_and_winner to a result flag (0, 1(win), 0.5)
