"""Model "addicted" in Blender: the wordmark's own face, extruded, bevelled, white.

  python word.py FONT.ttf OUT_DIR [--render]          (bpy from PyPI, Blender 5.3)
  npx @gltf-transform/cli meshopt OUT_DIR/addicted.raw.glb hands/addicted.glb --level medium

FONT.ttf   Instrument Serif Regular (OFL). audit/instrument.woff2 converts with
           fontTools: f = TTFont(path); f.flavor = None; f.save("instrument.ttf")
--render   also writes OUT_DIR/word_render.png, a Cycles still to check the bevel by
The PyPI bpy has no Draco or meshopt bridge, so compression is a second step:
gltf-transform's meshopt takes the export from 1.6MB to ~0.5MB, decoded in the
page by three.js's MeshoptDecoder with no extra fetch.
"""
import math
import os
import sys
import bpy
from mathutils import Matrix, Vector

font_path, out_dir = sys.argv[1], sys.argv[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene

cu = bpy.data.curves.new("addicted", "FONT")
cu.body = "addicted"
cu.font = bpy.data.fonts.load(os.path.abspath(font_path))
cu.size = 1.0
cu.align_x = "CENTER"
cu.align_y = "CENTER"
cu.offset = 0.006           # a hair of weight: the face's hairlines are fine for a solid
cu.extrude = 0.045          # shallow: near edge-on it still reads as letters, not a stack of slabs
cu.bevel_depth = 0.016      # the rounded edge the light runs along as it turns
cu.bevel_resolution = 4
cu.resolution_u = 14
ob = bpy.data.objects.new("addicted", cu)
scn.collection.objects.link(ob)
bpy.context.view_layer.objects.active = ob
ob.select_set(True)

# curve -> mesh, welded, smooth-shaded but crisp where faces turn hard
bpy.ops.object.convert(target="MESH")
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.remove_doubles(threshold=1e-5)
bpy.ops.mesh.quads_convert_to_tris()
bpy.ops.object.mode_set(mode="OBJECT")
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
for m in list(ob.modifiers):
    bpy.ops.object.modifier_apply(modifier=m.name)

# centred on its own bounds, so it spins about its middle
ctr = sum((Vector(c) for c in ob.bound_box), Vector()) / 8
ob.data.transform(Matrix.Translation(-ctr))
print("dims", tuple(round(v, 4) for v in ob.dimensions), "tris", len(ob.data.polygons))

mat = bpy.data.materials.new("porcelain")
mat.use_nodes = True
b = mat.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.92, 0.93, 0.95, 1)
b.inputs["Roughness"].default_value = 0.18
b.inputs["Coat Weight"].default_value = 1.0
b.inputs["Coat Roughness"].default_value = 0.05
ob.data.materials.append(mat)

bpy.ops.export_scene.gltf(filepath=os.path.join(out_dir, "addicted.raw.glb"), export_format="GLB",
                          use_selection=True, export_apply=True,
                          # the text faces +Z and reads up +Y, which is already a camera's view in
                          # glTF terms: converting to Y-up would lay it on its back
                          export_yup=False,
                          export_normals=True, export_texcoords=False, export_materials="EXPORT")

if "--render" in sys.argv:
    world = bpy.data.worlds.new("void")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0, 0, 0, 1)
    scn.world = world

    def area(name, loc, rot, size, energy, color=(1, 1, 1)):
        light = bpy.data.lights.new(name, "AREA")
        light.size, light.energy, light.color = size, energy, color
        o = bpy.data.objects.new(name, light)
        o.location, o.rotation_euler = loc, rot
        scn.collection.objects.link(o)

    area("top", (0, 1.5, 3), (math.radians(-25), 0, 0), 3.0, 260)
    area("key", (-3, 1, 2.5), (math.radians(-20), math.radians(-50), 0), 2.0, 180)
    area("rim", (3, -0.5, -2), (math.radians(160), math.radians(55), 0), 2.0, 140, (0.6, 0.78, 1.0))
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scn.collection.objects.link(cam)
    cam.location, cam.data.lens, scn.camera = (0, 0, 6.2), 85, cam
    ob.rotation_euler = (0, math.radians(-28), 0)
    scn.render.engine = "CYCLES"
    scn.cycles.samples, scn.cycles.device = 48, "CPU"
    scn.render.resolution_x, scn.render.resolution_y = 1600, 600
    scn.view_settings.view_transform = "AgX"
    scn.render.filepath = os.path.join(out_dir, "word_render.png")
    bpy.ops.render.render(write_still=True)
