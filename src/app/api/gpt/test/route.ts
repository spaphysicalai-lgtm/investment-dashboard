import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { prompt, type = 'text' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Replicate 환경변수 체크
    const apiToken = process.env.REPLICATE_API_TOKEN;
    const textModel = process.env.REPLICATE_TEXT_MODEL || 'anthropic/claude-4.5-sonnet';
    const imageModel = process.env.REPLICATE_IMAGE_MODEL || 'black-forest-labs/flux-schnell';
    
    const model = type === 'image' ? imageModel : textModel;

    if (!apiToken) {
      return NextResponse.json(
        { 
          error: 'REPLICATE_API_TOKEN이 설정되지 않았습니다. .env.local 파일을 확인하세요.',
        },
        { status: 500 }
      );
    }

    // Replicate API 엔드포인트
    const replicateEndpoint = `https://api.replicate.com/v1/models/${model}/predictions`;

    console.log('Replicate API Request:', {
      endpoint: replicateEndpoint,
      model,
      type,
    });

    // 입력 파라미터 구성 (텍스트 vs 이미지)
    const input = type === 'image' 
      ? {
          prompt: prompt,
          num_outputs: 1,
        }
      : {
          prompt: prompt,
          max_new_tokens: 1000,
        };

    // Replicate API 호출
    const response = await fetch(replicateEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiToken}`,
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API Error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        { 
          error: `Replicate API Error: ${errorData.detail || errorData.message || 'Unknown error'}`,
          status: response.status,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('Replicate API Response:', JSON.stringify(data, null, 2));

    // Replicate는 비동기 처리이므로 prediction ID를 받음
    const predictionId = data.id;
    const getUrl = data.urls?.get || `https://api.replicate.com/v1/predictions/${predictionId}`;

    // 결과가 나올 때까지 polling (최대 90초)
    let result = data;
    let attempts = 0;
    const maxAttempts = 90;

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(getUrl, {
        headers: {
          'Authorization': `Token ${apiToken}`,
        },
      });

      if (!pollResponse.ok) {
        break;
      }

      result = await pollResponse.json();
      attempts++;
      
      console.log(`Polling attempt ${attempts}: status=${result.status}`);
    }

    if (result.status === 'failed') {
      return NextResponse.json(
        { error: `Model execution failed: ${result.error}` },
        { status: 500 }
      );
    }

    if (result.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Timeout: Model did not complete in time' },
        { status: 504 }
      );
    }

    // 결과 추출
    if (type === 'image') {
      // 이미지 생성: output은 이미지 URL 배열
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      
      return NextResponse.json({
        type: 'image',
        imageUrl: imageUrl,
        model: model,
        metrics: result.metrics,
      });
    } else {
      // 텍스트 생성: output은 텍스트 배열이거나 문자열
      let textResponse = '';
      if (Array.isArray(result.output)) {
        textResponse = result.output.join('');
      } else if (typeof result.output === 'string') {
        textResponse = result.output;
      } else {
        textResponse = 'No response';
      }

      return NextResponse.json({
        type: 'text',
        response: textResponse,
        model: model,
        metrics: result.metrics,
      });
    }
  } catch (error) {
    console.error('Replicate API Test Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
