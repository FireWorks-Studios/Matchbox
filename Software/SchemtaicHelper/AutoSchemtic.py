from skip import Symbol, Schematic
import json
import os

dir = os.path.dirname(__file__)
mappingdatafile = os.path.join(dir,'Mapping data')
dir_list = os.listdir(mappingdatafile)

saveSchDir = os.path.join(dir,'Generated Schematic')


gridOrigin = (15, 10)
unitSpace = 2.54
number_of_keyboard_pins = 26
            
def loadData(dir_list):
    sch = None
    config = None
    keyboard_mapping = None
    for file in dir_list:
        if sch is not None and config is not None and keyboard_mapping is not None:
            break
        if file.endswith('.kicad_sch'):
            sch = Schematic(os.path.join(mappingdatafile,file))
        if file == 'config.json':
            with open(os.path.join(mappingdatafile,file)) as f:
                config = json.load(f)
        if file.endswith('.json') and 'mapping' in file:
            with open(os.path.join(mappingdatafile,file)) as f:
                keyboard_mapping = json.load(f)

    if(sch is None):
        raise Exception('No schematic file found in the directory "Mapping data"') 
    if(config is None):
        raise Exception('No config file found in the directory "Mapping data"')
    if(keyboard_mapping is None):
        raise Exception('No keyboard mapping file found in the directory "Mapping data"')
    
    return sch, config, keyboard_mapping

def units_to_mm(u: int):
    return u * unitSpace

def to_grid(xunit: int, yunit: int):
    global unitSpace, gridOrigin
    return ((gridOrigin[0] * unitSpace) + (xunit * unitSpace), (gridOrigin[1] * unitSpace) + (yunit * unitSpace))

def create_J100(basedOn:Symbol, numrows:int, numcols:int, start_ref_count:int=1):
    table = []
    dcount = start_ref_count

    for row in range(numrows):
        column_symbol = []
        for col in range(numcols):
            newD = basedOn.clone()

            coords = to_grid(col*7, row*2)
            newD.move(coords[0]-(unitSpace/2), coords[1])
            newD.setAllReferences(f'J{dcount}')
            #create wire
        #    wire = sch.wire.new()
        #    wire.start_at()
        #    wire.delta_x = (unitSpace)*5/2
        #    wire.delta_y = 0

            lbl = sch.global_label.new()
            lbl.move(coords[0]-(unitSpace)*5/2, coords[1],0)
            lbl.value = f'Pin{dcount}'

            column_symbol.append(newD)
            dcount += 1
        table.append(column_symbol)
    return table

def create_M100(basedOn:Symbol, numrows:int, numcols:int, start_ref_count:int=1):
    table = []
    dcount = start_ref_count

    for row in range(numrows):
        column_symbol = []
        for col in range(numcols):
            newD = basedOn.clone()

            coords = to_grid(col*7+15, row*10)
            newD.move(coords[0]-(unitSpace/2), coords[1])
            newD.setAllReferences(f'M{dcount}')
        

            # Get the pins for the current M100 component
            pins = pins_per_M100[dcount - start_ref_count]


            for label, pin in enumerate(pins):

                lbl = sch.global_label.new()
                Conn02x05OddEvenPinMapping = [8, 3, 4, 6, 5, 0, 7, 9, 2, 1]
                x,y,r = newD.pin[Conn02x05OddEvenPinMapping[label]].location.value
                lbl.move(x,y,r)
                lbl.value = f'Pin{pin}'

            column_symbol.append(newD)
            dcount += 1
        table.append(column_symbol)
    return table

def create_D1(basedOn:Symbol, numrows:int, numcols:int, start_ref_count:int=1):
    table = []
    dcount = start_ref_count

    for row in range(numrows):
        column_symbol = []
        for col in range(numcols):
            newD = basedOn.clone()

            coords = to_grid(col*7+30, row*20+20)
            newD.move(coords[0]-(unitSpace/2), coords[1])
            newD.setAllReferences(f'D{dcount}')


            for label in range(len(newD.pin)):
                
                lbl = sch.global_label.new()
                Conn02x30OddEvenPinMapping = [21, 30, 19, 12, 33, 54, 52, 57, 55, 22, 15, 4, 7, 26, 34, 13, 14, 23, 10, 25, 11, 37, 27, 16, 17, 20, 24, 18, 6, 28, 38, 29, 39, 31, 32, 35, 8, 36, 0, 40, 9, 1, 41, 2, 42, 3, 43, 44, 5, 45, 46, 47, 48, 49, 50, 51, 58, 56, 53, 59]
                x,y,r = newD.pin[Conn02x30OddEvenPinMapping[label]].location.value
                lbl.move(x,y,r)
                lbl.value = f'Pin{label//2+1}'   

            column_symbol.append(newD)
            dcount += 1
        table.append(column_symbol)

def extract_pins_per_M100(config, keyboard_mapping):
    # Extract the keys to map on the M100 component
    keys_to_map = config['premap']

    # Create a list of pins needed to be attached to each M100 component
    pins_needed = []
    for key in keys_to_map:
        if key in keyboard_mapping['mapping']:
            pins_needed.extend(keyboard_mapping['mapping'][key])
    
    # Split the pins into groups of 10 for each M100 component
    pins_per_M100 = [pins_needed[i:i + 10] for i in range(0, len(pins_needed), 10)]
    return pins_per_M100

# load the matchbox mapping
sch, config, keyboard_mapping = loadData(dir_list)

# Extract the pins needed for each M100 component
pins_per_M100 = extract_pins_per_M100(config, keyboard_mapping)

# Create the J100, M100 and D1 components
print(create_J100(sch.symbol.J100, number_of_keyboard_pins, 1))
print(create_M100(sch.symbol.M100, 4, 1))
create_D1(sch.symbol.D1, 1, 1)

# Save the schematic
sch.write(os.path.join(saveSchDir, 'Test.kicad_sch'))




