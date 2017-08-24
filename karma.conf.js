process.env.PHANTOMJS_BIN = './node_modules/phantomjs-prebuilt/bin/phantomjs'

const rollupPlugins = [
	require('rollup-plugin-buble')(),
]

if (!process.env.TRAVIS || process.env.COVERAGE) {
	const istanbul = require('rollup-plugin-istanbul')
	const config = {
		exclude: [
			'test/**',
			'**/node_modules/**',
		],
		instrumenterConfig: {
			embedSource: true,
		},
	}
	rollupPlugins.push(istanbul(config))
}

module.exports = function (karma) {
	karma.set({
		frameworks: ['mocha', 'sinon-chai'],

		preprocessors: {
			'test/main.spec.js': ['rollup'],
		},

		files: [
			{ pattern: 'test/main.spec.js', watched: false },
		],

		rollupPreprocessor: {
			plugins: rollupPlugins,
			format: 'iife',
			name: 'rematrix',
			sourcemap: 'inline',
		},

		colors: true,
		concurrency: 5,
		logLevel: karma.LOG_ERROR,
		singleRun: true,

		browserDisconnectTimeout: 60 * 1000,
		browserDisconnectTolerance: 1,
		browserNoActivityTimeout: 60 * 1000,
		captureTimeout: 3 * 60 * 1000,
	})

	if (process.env.TRAVIS) {

		if (process.env.COVERAGE) {
			karma.set({
				autoWatch: false,
				browsers: ['PhantomJS'],
				coverageReporter: {
					type: 'lcovonly',
					dir: 'coverage/',
				},
				reporters: ['mocha', 'coverage', 'coveralls'],
			})

		} else {
			const customLaunchers = require('./sauce.conf')
			karma.set({
				autoWatch: false,
				browsers: Object.keys(customLaunchers),
				customLaunchers,
				reporters: ['dots', 'saucelabs'],
				sauceLabs: {
					testName: 'Rematrix',
					build: process.env.TRAVIS_BUILD_NUMBER || 'manual',
					tunnelIdentifier: process.env.TRAVIS_BUILD_NUMBER || 'autoGeneratedTunnelID',
					recordVideo: true,
					connectOptions: {
						'no-ssl-bump-domains': 'all', // because Android 4 has an SSL error?
					},
				},
			})
		}

	} else {
		karma.set({
			browsers: ['PhantomJS'],
			coverageReporter: {
				type: 'lcov',
				dir: '.ignore/coverage/',
			},
			reporters: ['mocha', 'coverage'],
		})
	}
}
