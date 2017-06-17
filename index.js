/**
 * Created by chenhao on 2017/6/17.
 */

import IFlyTekIAT from './src/IFlyTekIAT';

module.exports = IFlyTekIAT;

output: {
    path: path.join(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'react-iflytek',
        library: 'IFlyTekIAT'
}