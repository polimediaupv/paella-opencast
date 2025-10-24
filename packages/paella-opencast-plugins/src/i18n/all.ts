import type { Dictionary } from '@asicupv/paella-core';
import caES from './ca-ES.json';
import deDE from './de-DE.json';
import enUS from './en-US.json';
import esES from './es-ES.json';
import frFR from './fr-FR.json';
import itIT from './it-IT.json';


const defaultDictionaries: Record<string, Dictionary> = {};


defaultDictionaries['ca-ES'] = caES;
defaultDictionaries['ca'] = caES;
defaultDictionaries['de-DE'] = deDE;
defaultDictionaries['de'] = deDE;
defaultDictionaries['en-US'] = enUS;
defaultDictionaries['en'] = enUS;
defaultDictionaries['es-ES'] = esES;
defaultDictionaries['es'] = esES;
defaultDictionaries['fr-FR'] = frFR;
defaultDictionaries['fr'] = frFR;
defaultDictionaries['it-IT'] = itIT;
defaultDictionaries['it'] = itIT;

export default defaultDictionaries;
