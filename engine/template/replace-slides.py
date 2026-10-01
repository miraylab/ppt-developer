"""Replace only selected slide parts; retain every other original part byte-for-byte.

Supported generated content: native shapes/text and embedded images/SVGs.
Layouts stay bound to the latest user deck. Unsupported relationships fail closed.
"""
import json
import copy
import posixpath as P
import sys
import uuid
import zipfile
import xml.etree.ElementTree as E

REL = 'http://schemas.openxmlformats.org/package/2006/relationships'
DOC = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PPT = 'http://schemas.openxmlformats.org/presentationml/2006/main'
CT = 'http://schemas.openxmlformats.org/package/2006/content-types'

def relpath(part):
    return P.join(P.dirname(part), '_rels', P.basename(part) + '.rels')

def resolve(part, target):
    result = P.normpath(P.join(P.dirname(part), target.lstrip('/'))) if not target.startswith('/') else target[1:]
    if result.startswith('../'): raise ValueError('Relationship escapes package')
    return result

def slide_order(z):
    rels = E.fromstring(z.read('ppt/_rels/presentation.xml.rels'))
    lookup = {r.get('Id'): resolve('ppt/presentation.xml', r.get('Target')) for r in rels}
    return [lookup[s.get('{'+DOC+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).findall('.//{'+PPT+'}sldId')]

def replace(base, donor, output, selected):
    with zipfile.ZipFile(base) as original, zipfile.ZipFile(donor) as generated:
        targets, sources = slide_order(original), slide_order(generated)
        if len(sources) != len(selected) or len(set(selected)) != len(selected): raise ValueError('Invalid replacement count')
        changes = {}; additions = {}; token = uuid.uuid4().hex
        types = E.fromstring(original.read('[Content_Types].xml'))
        gen_types = E.fromstring(generated.read('[Content_Types].xml'))
        defaults = {e.get('Extension'): e.get('ContentType') for e in gen_types if e.tag.endswith('Default')}
        overrides = {e.get('PartName'): e.get('ContentType') for e in gen_types if e.tag.endswith('Override')}
        for number, source in zip(selected, sources):
            if number < 1 or number > len(targets): raise ValueError('Slide out of bounds')
            target = targets[number-1]
            oldrels = E.fromstring(original.read(relpath(target)))
            newrels = E.fromstring(generated.read(relpath(source)))
            oldlayout = next(r for r in oldrels if r.get('Type').endswith('/slideLayout'))
            for r in newrels:
                kind = r.get('Type').split('/')[-1]
                if kind == 'slideLayout':
                    oldpart = resolve(target, oldlayout.get('Target'))
                    newpart = resolve(source, r.get('Target'))
                    if E.fromstring(original.read(oldpart)).find('{'+PPT+'}cSld').get('name') != E.fromstring(generated.read(newpart)).find('{'+PPT+'}cSld').get('name'):
                        raise ValueError('Different layouts: explicit migration required')
                    r.set('Target', oldlayout.get('Target'))
                elif r.get('TargetMode') == 'External':
                    continue
                elif kind == 'image':
                    part = resolve(source, r.get('Target'))
                    newname = f'ppt/media/hybrid-{token}-{len(additions)}{P.splitext(part)[1]}'
                    additions[newname] = generated.read(part)
                    r.set('Target', P.relpath(newname, P.dirname(target)))
                    content_type = overrides.get('/'+part, defaults.get(part.rsplit('.',1)[-1]))
                    if not content_type: raise ValueError('Missing image content type')
                    E.SubElement(types, '{'+CT+'}Override', PartName='/'+newname, ContentType=content_type)
                else:
                    raise ValueError('Unsupported generated relationship: '+kind)
            # Retain notes/comments attached to the user slide; their parts stay untouched.
            for r in oldrels:
                if r.get('Type').split('/')[-1] in ('notesSlide', 'comments', 'tags'):
                    r.set('Id', 'rIdHybridPreserved'+str(len(newrels)))
                    newrels.append(r)
            changes[target] = generated.read(source)
            changes[relpath(target)] = E.tostring(newrels, encoding='utf-8', xml_declaration=True)
        changes['[Content_Types].xml'] = E.tostring(types, encoding='utf-8', xml_declaration=True)
        with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as result:
            for info in original.infolist(): result.writestr(copy.copy(info), changes.get(info.filename, original.read(info.filename)))
            for name, data in additions.items(): result.writestr(name, data)
        with zipfile.ZipFile(output) as result:
            for name in original.namelist():
                if name not in changes and original.read(name) != result.read(name): raise ValueError('Protected part changed: '+name)
        return {'selectedSlides': selected, 'slideCount': len(targets), 'unchangedOriginalParts': len(original.namelist())-len(changes), 'changedParts': list(changes), 'addedMedia': len(additions)}

if __name__ == '__main__':
    print(json.dumps(replace(sys.argv[1], sys.argv[2], sys.argv[3], [int(n) for n in sys.argv[4].split(',')]), indent=2))
