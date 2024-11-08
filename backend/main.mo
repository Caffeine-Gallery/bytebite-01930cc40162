import Int "mo:base/Int";
import Nat "mo:base/Nat";

actor Snake {
    stable var highScore : Nat = 0;

    // Update the high score if the new score is higher
    public func updateHighScore(newScore : Nat) : async Nat {
        if (newScore > highScore) {
            highScore := newScore;
        };
        return highScore;
    };

    // Get the current high score
    public query func getHighScore() : async Nat {
        return highScore;
    };
}
