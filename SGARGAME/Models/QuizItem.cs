namespace Ivan_SGAR_GAME.Models
{
    public class QuizItem
    {
        public string QuestionText { get; set; }
        public List<string> Options { get; set; }
        // Índice de la opción correcta (0 para la primera, 1 para la segunda, etc.)
        public int CorrectAnswerIndex { get; set; }
        public string Explanation { get; set; }
    }
}
