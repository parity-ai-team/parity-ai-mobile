import { ApiError } from '@/shared/api/errors';
import { resolveMockResponse } from '@/mocks/handlers';
import { firstBirthFixture } from '@/mocks/scenarios/first-birth';
import { pastMeFixture } from '@/mocks/scenarios/past-me';
import { singleParentFixture, singleParentStressedFixture } from '@/mocks/scenarios/single-parent';

describe('resolveMockResponse — POST /v1/analyses', () => {
  it('returns the first-birth fixture for first_birth_dual_income', () => {
    const resolved = resolveMockResponse({
      method: 'POST',
      path: '/v1/analyses',
      body: { scenario_id: 'first_birth_dual_income' },
    });

    expect(resolved?.data).toBe(firstBirthFixture);
  });

  it('returns the past-me fixture for past_me_transition', () => {
    const resolved = resolveMockResponse({
      method: 'POST',
      path: '/v1/analyses',
      body: { scenario_id: 'past_me_transition' },
    });

    expect(resolved?.data).toBe(pastMeFixture);
  });

  it('returns the single-parent baseline fixture when no stress toggle is set', () => {
    const resolved = resolveMockResponse({
      method: 'POST',
      path: '/v1/analyses',
      body: { scenario_id: 'single_parent_stress' },
    });

    expect(resolved?.data).toBe(singleParentFixture);
  });

  it('returns the single-parent stressed fixture when income_delay_weeks is set', () => {
    const resolved = resolveMockResponse({
      method: 'POST',
      path: '/v1/analyses',
      body: { scenario_id: 'single_parent_stress', stress: { income_delay_weeks: 2 } },
    });

    expect(resolved?.data).toBe(singleParentStressedFixture);
  });

  it('returns the single-parent stressed fixture when child_support_missed is true', () => {
    const resolved = resolveMockResponse({
      method: 'POST',
      path: '/v1/analyses',
      body: { scenario_id: 'single_parent_stress', stress: { child_support_missed: true } },
    });

    expect(resolved?.data).toBe(singleParentStressedFixture);
  });

  it('throws a 422 ApiError for an unknown scenario_id', () => {
    expect(() =>
      resolveMockResponse({
        method: 'POST',
        path: '/v1/analyses',
        body: { scenario_id: 'not_a_real_scenario' },
      }),
    ).toThrow(ApiError);

    try {
      resolveMockResponse({
        method: 'POST',
        path: '/v1/analyses',
        body: { scenario_id: 'not_a_real_scenario' },
      });
      throw new Error('expected resolveMockResponse to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(422);
      expect((error as ApiError).code).toBe('VALIDATION_ERROR');
    }
  });
});

describe('resolveMockResponse — GET /v1/analyses/{id}', () => {
  it('round-trips a created analysis back to the same fixture', () => {
    const resolved = resolveMockResponse({
      method: 'GET',
      path: `/v1/analyses/${firstBirthFixture.analysis_id}`,
    });

    expect(resolved?.data).toBe(firstBirthFixture);
  });

  it('throws a 404 ApiError for an unknown analysis id', () => {
    try {
      resolveMockResponse({ method: 'GET', path: '/v1/analyses/ana_does_not_exist' });
      throw new Error('expected resolveMockResponse to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
      expect((error as ApiError).code).toBe('ANALYSIS_NOT_FOUND');
    }
  });
});

describe('resolveMockResponse — unmatched requests', () => {
  it('returns undefined for a method/path with no handler', () => {
    const resolved = resolveMockResponse({
      method: 'DELETE',
      path: `/v1/analyses/${firstBirthFixture.analysis_id}`,
    });

    expect(resolved).toBeUndefined();
  });
});
