public class createFXML
{
	public static void main (String [] args){
		for(int i=0; i<1400; i+=100)
		{
			for(int k=0; k<1050; k+=75){
				System.out.println("map.put(\"IMGB"+i+"B"+k+"\",getIMGB"+i+"B"+k+"());");
			}
		}
	}
}