import axios from 'axios';

const buildPrompt = ({
  student_name,
  class_name,
  exam_date,
  average_score,
  parts,
  previous_comment
}) => {
  const safeParts = Array.isArray(parts) ? parts : [];
  const partSummary = safeParts
    .map((part) => {
      const name = part?.name || '영역';
      const score = Number(part?.score || 0);
      const maxScore = Number(part?.max_score || 0);
      const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      return `- ${name}: ${score}/${maxScore} (${percent}%)`;
    })
    .join('\n');

  return `너는 영어학원 담임교사의 코멘트 작성 보조야.
아래 데이터를 바탕으로 학부모 전달용 코멘트 초안을 한국어 존댓말로 작성해.

[작성 규칙]
1) 3~4문장, 220자 이내
2) 장점 1개 + 개선점 1개 + 다음 학습 제안 1개 포함
3) 단정적/비난 표현 금지, 격려하는 톤 유지
4) 점수/날짜/반 정보는 입력값만 사용하고 임의 생성 금지
5) 학부모 전달용 자연스러운 교사 문체 사용 (예: "~보였습니다", "~확인되었습니다", "~도움이 됩니다")
6) 과한 감정 표현/어색한 높임말 금지 (예: "보여주셨습니다", "기쁩니다" 금지)
7) 개선점은 부드럽게 표현 (예: "향상이 필요" 대신 "한 단계 더 성장할 수 있는 부분")
8) 결과는 "코멘트:" 한 줄로만 출력
9) 아래 표현은 절대 사용 금지:
   - "보여주셨습니다", "향상이 필요할 수 있는 부분", "목표로 해보시기 바랍니다"
10) 권장 표현:
   - "보였습니다", "한 단계 더 성장할 수 있는 부분", "꾸준히 진행하면 도움이 됩니다"
11) 마지막 문장은 반드시 "다음 학습에서는"으로 시작하고, 구체적인 학습 행동 1~2개를 제안

[입력 데이터]
학생명: ${student_name || '-'}
반: ${class_name || '-'}
시험일: ${exam_date || '-'}
평균점수: ${Number(average_score || 0).toFixed(1)}
영역별 점수:
${partSummary || '- 데이터 없음'}
이전 코멘트: ${previous_comment || '없음'}`;
};

export const generateBimonthlyComment = async (req, res) => {
  try {
    const {
      student_name,
      class_name,
      exam_date,
      average_score,
      parts,
      previous_comment
    } = req.body || {};

    if (!student_name || !exam_date || !Array.isArray(parts)) {
      return res.status(400).json({
        success: false,
        message: 'student_name, exam_date, parts는 필수입니다.'
      });
    }

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5:7b-instruct';
    const prompt = buildPrompt({
      student_name,
      class_name,
      exam_date,
      average_score,
      parts,
      previous_comment
    });

    const response = await axios.post(
      `${ollamaBaseUrl}/api/generate`,
      {
        model: ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.5
        }
      },
      {
        timeout: 45000
      }
    );

    const rawText = response?.data?.response || '';
    const comment = String(rawText).replace(/^코멘트:\s*/i, '').trim();

    if (!comment) {
      return res.status(502).json({
        success: false,
        message: 'AI 코멘트 생성 결과가 비어 있습니다.'
      });
    }

    return res.json({
      success: true,
      data: {
        comment
      }
    });
  } catch (error) {
    const isConnError =
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ECONNABORTED';

    if (isConnError) {
      return res.status(503).json({
        success: false,
        message:
          'Ollama 서버에 연결할 수 없습니다. 로컬에서 Ollama 실행 상태를 확인해주세요.'
      });
    }

    return res.status(500).json({
      success: false,
      message: `AI 코멘트 생성 실패: ${error.message}`
    });
  }
};
