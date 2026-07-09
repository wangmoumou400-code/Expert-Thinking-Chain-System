const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  '';

const supabaseTable = process.env.SUPABASE_TABLE || 'feedback_records';

export async function saveFeedbackRecord(record) {
  if (!supabaseUrl || !supabaseKey) {
    return {
      saved: false,
      reason: 'Supabase环境变量未配置'
    };
  }

  if (!supabaseUrl.startsWith('https://')) {
    throw new Error('SUPABASE_URL格式不正确，应类似 https://xxxx.supabase.co');
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${supabaseTable}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      participant_id: record.participantId || '',
      material_code: record.materialCode || '',
      condition: record.condition || '',
      condition_label: record.conditionLabel || '',
      model: record.model || '',
      prompt_version: record.promptVersion || '',
      input_text: record.inputText || '',
      feedback_text: record.feedbackText || '',
      raw_ai_output: record.rawAiOutput || '',
      parsed_json: record.parsedJson || null,
      mock: Boolean(record.mock)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase保存失败：${response.status} ${errorText}`);
  }

  return { saved: true };
}
