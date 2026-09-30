import { evaluatePasswordStrength } from './password-strength';

describe('evaluatePasswordStrength', () => {
  it('never rates a password under 8 characters above too short', () => {
    const strength = evaluatePasswordStrength('Ab1!');

    expect(strength.score).toBe(0);
    expect(strength.label).toBe('Too short');
    expect(strength.tip).toBe('use 8 or more characters');
    expect(strength.tone).toBe('danger');
  });

  it('names the first criterion that is actually missing', () => {
    const strength = evaluatePasswordStrength('abcdefg1');

    expect(strength.score).toBe(2);
    expect(strength.label).toBe('Fair');
    expect(strength.tip).toBe('mix upper and lower case');
    expect(strength.tone).toBe('warning');
  });

  it('asks for a number and then for a symbol or more length', () => {
    expect(evaluatePasswordStrength('Abcdefgh').tip).toBe('add a number');
    expect(evaluatePasswordStrength('Abcdefg1').tip).toBe('add a symbol or make it longer');
    expect(evaluatePasswordStrength('Abcdefg1').label).toBe('Good');
  });

  it('rates a password that meets every criterion as strong', () => {
    const withSymbol = evaluatePasswordStrength('Abcdefg1!');
    const withLength = evaluatePasswordStrength('Abcdefghijklm1');

    expect(withSymbol).toEqual({ score: 4, label: 'Strong', tip: 'nice', tone: 'success' });
    expect(withLength.label).toBe('Strong');
  });

  it('rates a long lowercase password as weak with a red tone', () => {
    const strength = evaluatePasswordStrength('abcdefgh');

    expect(strength.score).toBe(1);
    expect(strength.label).toBe('Weak');
    expect(strength.tone).toBe('danger');
  });
});
