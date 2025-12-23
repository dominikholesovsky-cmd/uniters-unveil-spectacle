-- Povolit mazání hlasů
CREATE POLICY "Anyone can delete charity votes" 
ON charity_votes FOR DELETE 
USING (true);