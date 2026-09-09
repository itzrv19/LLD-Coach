'use client';

import { useState } from 'react';
import { saveDraftAction, submitAttemptAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

type Props = {
  attempt: any;
  problem: any;
  existingSubmission: any;
};

export default function WorkspaceClient({ attempt, problem, existingSubmission }: Props) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    requirementsUnderstanding: existingSubmission?.requirementsUnderstanding || '',
    assumptions: existingSubmission?.assumptions || '',
    classesAndResponsibilities: existingSubmission?.classesAndResponsibilities || '',
    relationships: existingSubmission?.relationships || '',
    designExplanation: existingSubmission?.designExplanation || '',
    edgeCases: existingSubmission?.edgeCases || '',
    tradeOffs: existingSubmission?.tradeOffs || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveDraftAction({
        attemptId: attempt.id,
        submissionId: existingSubmission?.id,
        ...formData
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = [
      'requirementsUnderstanding', 'assumptions', 'classesAndResponsibilities', 
      'relationships', 'designExplanation', 'edgeCases'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} section before submitting.`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitAttemptAction({
        attemptId: attempt.id,
        submissionId: existingSubmission?.id,
        ...formData
      });
      // The action redirects, so we just wait
    } catch (err: any) {
      setError(err.message || 'Failed to submit attempt');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Problem Context Pane */}
      <div className="w-full lg:w-1/3 flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
        <div className="p-4 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Problem Context
          </h2>
          <span className="text-xs font-medium px-2 py-1 bg-slate-200 text-slate-700 rounded-md">Reference</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{problem.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{problem.shortDescription}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider text-blue-600">Requirements</h4>
            <div className="text-sm text-slate-700 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <p className="whitespace-pre-wrap font-mono">{problem.functionalReqs}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider text-amber-600">Constraints</h4>
            <div className="text-sm text-slate-700 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <p className="whitespace-pre-wrap font-mono">{problem.constraints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Pane */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Your Design Solution
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Evaluation'}
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <form className="space-y-8 max-w-3xl mx-auto">
            <Section 
              title="1. Requirements Understanding" 
              name="requirementsUnderstanding"
              value={formData.requirementsUnderstanding}
              onChange={handleChange}
              placeholder="Summarize your understanding of the core requirements and the primary goal of the system..."
              required
            />
            
            <Section 
              title="2. Assumptions" 
              name="assumptions"
              value={formData.assumptions}
              onChange={handleChange}
              placeholder="List any constraints or assumptions you are making about the problem space..."
              required
            />
            
            <Section 
              title="3. Classes & Responsibilities" 
              name="classesAndResponsibilities"
              value={formData.classesAndResponsibilities}
              onChange={handleChange}
              placeholder="List the core entities, their primary responsibilities, and main attributes/methods..."
              required
            />
            
            <Section 
              title="4. Relationships" 
              name="relationships"
              value={formData.relationships}
              onChange={handleChange}
              placeholder="Describe how these classes interact. Is it composition, inheritance, or aggregation?..."
              required
            />
            
            <Section 
              title="5. Design Explanation" 
              name="designExplanation"
              value={formData.designExplanation}
              onChange={handleChange}
              placeholder="Walk through a core flow (e.g. how a user performs the main action) and explain why you structured it this way. Mention any design patterns used..."
              required
            />
            
            <Section 
              title="6. Edge Cases" 
              name="edgeCases"
              value={formData.edgeCases}
              onChange={handleChange}
              placeholder="What edge cases did you consider and how does your design handle them?..."
              required
            />
            
            <Section 
              title="7. Trade-offs (Optional)" 
              name="tradeOffs"
              value={formData.tradeOffs}
              onChange={handleChange}
              placeholder="What are the limitations of your design? What would you change if requirements scale?..."
            />
          </form>
        </div>
      </div>
    </div>
  );
}

function Section({ title, name, value, onChange, placeholder, required = false }: any) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-bold text-slate-800">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={6}
        placeholder={placeholder}
        className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 bg-slate-50 text-slate-900 transition-colors focus:bg-white resize-y placeholder:text-slate-400"
      />
    </div>
  );
}
