/* eslint-env jest */
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

/* global global */
if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = TextDecoder;
}

