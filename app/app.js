// Your program here
//const fs = require("fs");
const Meyda = require("meyda");
const p5 = require("p5");
const dat = require("dat.gui");
const StartAudioContext = require("startaudiocontext");


 //const file = document.getElementById('text');

 // if(file){
 //    const texts = getAsText(file);
 //  }

let lastFeatures;


function readAudioFromFile(callback){
	const context = new AudioContext();
	StartAudioContext(context);

	const htmlAudioElement = document.getElementById("audio");

	const source = context.createMediaElementSource(htmlAudioElement);

	source.connect(context.destination);

	if (callback) callback(context,source);


}


readAudioFromFile((context,source)=>{
	const analyzer = Meyda.createMeydaAnalyzer({
		audioContext: context,
		source: source,
		bufferSize: 512,
		featureExtractors: ["loudness","perceptualSpread"],
		callback:(features)=> {
			lastFeatures = features;
		}
	});

	analyzer.start();

});




const textDrawing = (p) =>{
	let speed = 0.1;
	let lastradius = 0;
	let lastlip=0;
	let lasth=0;
	var text1,text2,text3,sentences;
	let idx = 1;
	let gates=[];
	let frames=[];
	let angles=[];
	let posx = [];
	let posy = [];
    const params = {
		scale: 2
	}
	const gui = new dat.GUI();
	gui.add(params,"scale",0,2);


	p.preload = () => {
		texts = p.loadStrings("dialogues.txt");
		const htmltext = document.getElementById("text");
		console.log(htmltext);
		text4 = "indifference, that’s how i feel\nstripped, bothered, deprived of means to make meanings, drowned in bright-colored plastic balls,\ni want to feel, to live under fish scale! \nmy absurdity officially ended when the poem is finished\nsince then everything i wrote bear a resemblance of absolute insincerity\n a fake illusion\na pale lamentation\na conundrum that roots in its existential binary";
		text5 = "the plague scares me not\nit’s the mundanity\nthe vast amount of assumptions one has to make, in exchange for a clarity of minds\nhow horrifying\nhow do i traverse between these lands without, being laid off by one\nwords play roles \nwithout a king\nkiller in one, total bore in the other\nmy heroes killed themselves, and those knights they pretend \nto know my secrets \nbut truth is they know no better than \ntheir horses"
		texts = [text4,text5];
		sentences = p.splitTokens(texts[0],"\n,");

		

		//console.log(sentences[0],gates);
	};
	p.setup = () => {
		p.createCanvas(800,800);
		p.colorMode(p.RGB,255);
		p.background(255,255,255);
		p.reset();
		//let sentences = p.split(text,"\n");
		//let rs = rita.RiString(text);

	};

	p.reset = ()=>{
		gates=[];
	    frames=[];
	    angles=[];
	    posx = [];
	    posy = [];
		for (var i=0;i<sentences.length;i++)
			{
				gates.push(0);
				frames.push(0);
				posx.push(p.width/2);
				posy.push(p.height/2);
				angles.push(p.PI/p.random(10));
			}
	}

	p.draw = () => {
		p.colorMode(p.RGB,255);
		p.background(255,255,255);
		if(lastFeatures){
			p.noFill();
			//console.log(lastFeatures.spectralSpread);
			//speed = 0.1+lastFeatures.spectralSkewness;
			// specific will be an array of 24 values
			if(isNaN(lastFeatures.perceptualSpread)==true){
				speed = 0.1;
				
			}
			else{
			    speed = 0.1+lastFeatures.perceptualSpread*0.1;
			}
			console.log(lastFeatures);
			lastFeatures.loudness.specific.forEach((loudness,i)=>{

				let radius = loudness * 100;
				let w = p.width;
				let h = p.height;
				let mouthsize = 100 * params.scale;;
				let mouthh = 50+loudness*100;
				let liph = loudness*100;

				//draw the lip
				mouthh = 0.2*lasth+0.8*mouthh;
				liph = 0.1*liph+0.9*lastlip;
				lastlip = liph;
				let size = 2;
				p.drawlips(mouthsize*size,mouthh*size,liph*size,w/2,h/2);
					
				//animate the text
				for (var i=0;i<sentences.length;i++){
					//if mouth just opened, skip the painted lines and release one
					//console.log("are you in here",radius,lastradius);
					if(radius>lastradius && gates[i]==0)
					{
						if(i>0 && gates[i-1]==1 && p.frameCount-200>frames[i-1]){
							gates[i]=1; 
							frames[i]=p.frameCount;
					}
						else if(i==0){
							gates[i]=1 ;
							frames[i]=p.frameCount;
						}
						//console.log(frames);
						//break;
					}
					//if mouth is still open, need to keep painting the released ones
					//else if(radius>0 && lastradius>0 && gates[i]==1)
					//{
					//	p.letgo(sentences[i],0.1,i*p.PI/sentences.length,frames[i]);
					//}
					p.letgo(sentences[i],posx[i],posy[i],angles[i],gates[i],speed,i);

				}
				lastradius = radius;
				
				if(gates[sentences.length-1]==1 && p.frameCount-100>frames[sentences.length-1])
				{
					
					sentences = p.splitTokens(texts[idx],"\n,")
					p.reset();
					idx+=1;
					if(idx>1)
					{
						idx=0;
					}
					console.log("reset??");

				}
			})



		}


	}
	p.letgo = (text,x,y,angle,gate,speed,i) => {
		if(gate==1){
			p.textSize(15);
			//p.translate(x, y);
			//p.rotate(angle);
			p.colorMode(p.RGB,255);
			p.stroke(255, 204, 0);
			p.textStyle(p.NORMAL);
			p.strokeWeight(0);
			p.rotate(angle);
			p.fill(0, 102, 153);
			p.fill(13, 12, 12);
			p.textFont('Georgia');
			//p.text(text,speed*p.cos(angle)+x,speed*p.sin(angle)+y);
			p.text(text,speed+x,y);
			//posx[i]=speed*p.cos(angle)+x;
			//posy[i]=speed*p.sin(angle)+y;
			posx[i]=speed+x;
			posy[i]=y;
			//console.log(x,y,posx,posy);
			//console.log(gates,frames);
			
		}
		//speed+=0.1;
	};
	p.drawlips = (mouthsize,mouthh,liph,centerx,centery)=>{
		//let w = p.width;
		//let h = p.height;
		p.colorMode(p.HSB,255);
		p.fill(0, 255, 153);
		//p.strokeWeight(4);
		//p.stroke(31);
		p.noStroke();
		p.beginShape();
		p.vertex(centerx-mouthsize,centery);
		p.quadraticVertex(centerx-mouthsize/2,centery-mouthh,centerx,centery-liph);
		p.quadraticVertex(centerx+mouthsize/2,centery-mouthh,centerx+mouthsize,centery);
		p.quadraticVertex(centerx,centery-liph,centerx-mouthsize,centery);
		p.endShape();

		p.beginShape();
		p.vertex(centerx-mouthsize,centery);
		p.quadraticVertex(centerx,centery+liph,centerx+mouthsize,centery);
		p.quadraticVertex(centerx,centery+mouthh,centerx-mouthsize,centery);
		
		p.endShape();
	}
}




//const myp5 = new p5(basicDrawing, "main");

const myp5 = new p5(textDrawing, "main");









