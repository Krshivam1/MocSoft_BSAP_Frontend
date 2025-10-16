// SOLUTION: Add this to your questions.component.ts file

export class QuestionsComponent {
  
  // Add this method to your component
  formatFormula(formula: string): string {
    if (!formula || formula === 'NONE') return formula;
    
    const maxLength = 20; // Break every 20 characters
    let result = '';
    
    for (let i = 0; i < formula.length; i += maxLength) {
      if (i > 0) result += '\n'; // Add line break
      result += formula.substring(i, i + maxLength);
    }
    
    return result;
  }
  
  // Your existing component code...
}