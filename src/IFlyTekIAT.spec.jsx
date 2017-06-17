/**
 * Created by chenhao on 2017/6/17.
 */

import React from "react/addons";
import IFlyTekIAT from "./IFlyTekIAT";

const params = "appid=5930eae9,appidkey=cc1dd11789760bda, lang=sms, acous=anhui, aue=speex-wb;-1, usr = mkchen, ssm = 1, sub = iat, net_type = wifi, rse = utf8, ent =sms16k, rst = plain, auf  = audio/L16;rate=16000, vad_enable = 1, vad_timeout = 5000, vad_speech_tail = 500, compress = igzip";

const onResult = (txt) => {
    console.log("onResult", txt)
};

describe('ReactComponentNpm', function () {
    var component;

    beforeEach(function () {
        component = React.addons.TestUtils.renderIntoDocument(
            <IFlyTekIAT iFlyTekParams={params} onResult={onResult}/>
        );
    });

    it('should render', function () {
        expect(component.getDOMNode().className).toEqual('IFlyTekIAT');
    });
});