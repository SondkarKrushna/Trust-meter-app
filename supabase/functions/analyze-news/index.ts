import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Analyzing URL:', url);

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the article content
    let articleContent = '';
    let articleTitle = '';
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Basic title extraction
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      articleTitle = titleMatch ? titleMatch[1].substring(0, 200) : 'Unknown';
      
      // Simple content extraction (remove HTML tags)
      articleContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000); // Limit to first 3000 chars
    } catch (error) {
      console.error('Error fetching article:', error);
      return new Response(
        JSON.stringify({ error: 'Unable to fetch article content from URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert fact-checker and misinformation analyst. Analyze news articles for credibility, reliability, and potential misinformation. 
            
Consider these factors:
1. Source credibility and reputation
2. Evidence and citations provided
3. Sensationalist or misleading language
4. Logical consistency and factual accuracy
5. Cross-reference with known reliable sources
6. Presence of clickbait or emotional manipulation
7. Bias and balanced perspective

Provide your analysis in JSON format with:
- is_fake: boolean (true if likely fake/misleading, false if credible)
- confidence_score: number between 0-100 (how confident you are in the assessment)
- analysis: detailed explanation of your findings (200-400 words)
- key_findings: array of 3-5 specific observations

Return ONLY valid JSON, no other text.`
          },
          {
            role: 'user',
            content: `Analyze this article for credibility and misinformation:

Title: ${articleTitle}
URL: ${url}

Content excerpt:
${articleContent}

Provide your analysis in JSON format.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response (extract JSON from potential markdown code blocks)
    let analysisResult;
    try {
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      analysisResult = JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('AI content:', aiContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
          const { error: dbError } = await supabaseClient
            .from('analysis_results')
            .insert({
              user_id: user.id,
              url,
              title: articleTitle,
              is_fake: analysisResult.is_fake,
              confidence_score: analysisResult.confidence_score,
              analysis_text: analysisResult.analysis,
            });

          if (dbError) {
            console.error('Error saving to database:', dbError);
          } else {
            console.log('Analysis saved to database');
          }
        }
      } catch (error) {
        console.error('Error with database operation:', error);
      }
    }

    return new Response(
      JSON.stringify({
        url,
        title: articleTitle,
        ...analysisResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-news function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});