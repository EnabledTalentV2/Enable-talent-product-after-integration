import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS, backendFetch } from '@/lib/api-config';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const cookies = request.headers.get('cookie') || '';
    const { id } = await context.params;
    const url = API_ENDPOINTS.jobs.detail(id);

    console.log('[Jobs API] GET job by ID ->', url);

    const backendResponse = await backendFetch(
      url,
      { method: 'GET' },
      cookies
    );

    console.log('[Jobs API] GET job by ID <- Status:', backendResponse.status);

    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error('[Jobs API] Backend error response:', responseText.substring(0, 1000));
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Jobs API] Failed to parse backend response as JSON');
      data = {
        error: 'Backend returned non-JSON response',
        details: responseText.substring(0, 200),
        status: backendResponse.status
      };
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('[Jobs API] Get job error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const cookies = request.headers.get('cookie') || '';
    const { id } = await context.params;
    const body = await request.json();
    const url = API_ENDPOINTS.jobs.detail(id);

    console.log('[Jobs API] PATCH job ->', url, body);

    const backendResponse = await backendFetch(
      url,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      cookies
    );

    console.log('[Jobs API] PATCH job <- Status:', backendResponse.status);

    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error('[Jobs API] Backend error response:', responseText.substring(0, 1000));
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Jobs API] Failed to parse backend response as JSON');
      data = {
        error: 'Backend returned non-JSON response',
        details: responseText.substring(0, 200),
        status: backendResponse.status
      };
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('[Jobs API] Update job error:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const cookies = request.headers.get('cookie') || '';
    const { id } = await context.params;
    const url = API_ENDPOINTS.jobs.detail(id);

    console.log('[Jobs API] DELETE job ->', url);

    const backendResponse = await backendFetch(
      url,
      { method: 'DELETE' },
      cookies
    );

    console.log('[Jobs API] DELETE job <- Status:', backendResponse.status);

    // DELETE typically returns 204 No Content on success
    if (backendResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseText = await backendResponse.text();

    if (backendResponse.status >= 400) {
      console.error('[Jobs API] Backend error response:', responseText.substring(0, 1000));
    }

    // Some APIs return data on delete
    if (backendResponse.ok) {
      if (!responseText) {
        return new NextResponse(null, { status: 200 });
      }
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data);
      } catch (parseError) {
        return new NextResponse(null, { status: 200 });
      }
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      data = {
        error: 'Backend returned non-JSON response',
        details: responseText.substring(0, 200),
        status: backendResponse.status
      };
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('[Jobs API] Delete job error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
