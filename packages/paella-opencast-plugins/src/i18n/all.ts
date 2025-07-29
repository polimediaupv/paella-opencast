import type { Dictionary } from '@asicupv/paella-core';
import enUS from './en-US.json';
import esES from './es-ES.json';


const defaultDictionaries: Record<string, Dictionary> = {};


defaultDictionaries['en-US'] = enUS;
defaultDictionaries['en'] = enUS;
defaultDictionaries['es-ES'] = esES;
defaultDictionaries['es'] = esES;

export default defaultDictionaries;
