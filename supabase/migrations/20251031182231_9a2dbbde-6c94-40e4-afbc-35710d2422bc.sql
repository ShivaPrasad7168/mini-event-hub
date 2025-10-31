-- Add DELETE policy for events table
CREATE POLICY "Anyone can delete events" 
ON public.events 
FOR DELETE 
USING (true);