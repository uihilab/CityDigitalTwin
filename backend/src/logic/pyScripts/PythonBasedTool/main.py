import sys, getopt
import warnings
warnings.filterwarnings('ignore')

# Get parameters from NodeJS
param1 = ''
param2 = ''
 
# Read command line args
myopts, args = getopt.getopt(sys.argv[1:],"a:b:")
# print(myopts)
###############################
# o == option
# a == argument passed to the o
###############################
for o, a in myopts:
    if o == '-a':
        param1=a
    elif o == '-b':
        param2=a
    else:
        print("Usage: %s -a param2 -b param2" % sys.argv[0])
# End of getting parameters
