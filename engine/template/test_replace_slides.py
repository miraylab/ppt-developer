import tempfile
import unittest
import zipfile
from pathlib import Path
import importlib.util
spec=importlib.util.spec_from_file_location('replace_slides',Path(__file__).with_name('replace-slides.py'))
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
replace=module.replace

R = 'http://schemas.openxmlformats.org/package/2006/relationships'
D = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
P = 'http://schemas.openxmlformats.org/presentationml/2006/main'

def fixture(file, count, prefix):
    with zipfile.ZipFile(file, 'w') as z:
        z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="svg" ContentType="image/svg+xml"/></Types>')
        z.writestr('ppt/presentation.xml',f'<p:presentation xmlns:p="{P}" xmlns:r="{D}"><p:sldIdLst>'+''.join(f'<p:sldId id="{i+255}" r:id="rId{i}"/>' for i in range(1,count+1))+'</p:sldIdLst></p:presentation>')
        z.writestr('ppt/_rels/presentation.xml.rels',f'<Relationships xmlns="{R}">'+''.join(f'<Relationship Id="rId{i}" Type="{D}/slide" Target="slides/slide{i}.xml"/>' for i in range(1,count+1))+'</Relationships>')
        z.writestr('ppt/slideLayouts/slideLayout1.xml',f'<p:sldLayout xmlns:p="{P}"><p:cSld name="same"/></p:sldLayout>')
        z.writestr('ppt/media/icon.svg', '<svg>'+prefix+'</svg>')
        for i in range(1,count+1):
            z.writestr(f'ppt/slides/slide{i}.xml', f'<slide>{prefix}-{i}</slide>')
            z.writestr(f'ppt/slides/_rels/slide{i}.xml.rels',f'<Relationships xmlns="{R}"><Relationship Id="rId1" Type="{D}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="{D}/image" Target="../media/icon.svg"/></Relationships>')

class Preservation(unittest.TestCase):
    def test_shared_parts_and_manual_slide_survive_replacement(self):
        with tempfile.TemporaryDirectory() as folder:
            a,b,c=[Path(folder)/n for n in ['base.pptx','donor.pptx','result.pptx']]
            fixture(a,3,'manual');fixture(b,1,'new')
            report=replace(a,b,c,[2])
            with zipfile.ZipFile(a) as before,zipfile.ZipFile(c) as after:
                for name in before.namelist():
                    if name not in report['changedParts']:self.assertEqual(before.read(name),after.read(name))
                self.assertEqual(after.read('ppt/slides/slide2.xml'),b'<slide>new-1</slide>')
                self.assertEqual(after.read('ppt/slides/slide1.xml'),b'<slide>manual-1</slide>')
                self.assertEqual(after.read('ppt/media/icon.svg'),b'<svg>manual</svg>')
                self.assertEqual(report['addedMedia'],1)
    def test_invalid_count_does_not_create_output(self):
        with tempfile.TemporaryDirectory() as folder:
            a,b,c=[Path(folder)/n for n in ['base.pptx','donor.pptx','result.pptx']]
            fixture(a,3,'manual');fixture(b,1,'new')
            with self.assertRaises(ValueError):replace(a,b,c,[1,2])
            self.assertFalse(c.exists())

if __name__=='__main__':unittest.main()
